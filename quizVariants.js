<script>
/**
 * ==================== NEW QUIZ MODES ====================
 * MCQ Branching and Free-Text modes for KnodeFlow
 */

/**
 * Grade prefix map for MCQ branching
 */
const GRADE_PREFIX_MAP = {
  correct: "Nice — correct.",
  partial: "Partly there.",
  incorrect: "Not quite."
};

/**
 * Run MCQ quiz with grade-based branching
 * @param {Object} params - { graph, startId, chatShell }
 * @param {Object} graph - Quiz graph with nodes containing: { id, prompt, options: [{label, grade, nextId}] }
 * @param {string} startId - Starting node ID
 * @param {ChatShell} chatShell - ChatShell instance
 */
async function runMCQ({ graph, startId, chatShell }) {
  if (!graph || !startId || !chatShell) {
    console.error('runMCQ: Missing required parameters');
    return;
  }

  const transcript = [];
  let currentId = startId;
  let questionCount = 0;

  // Process nodes linearly via nextId
  while (currentId && graph[currentId]) {
    const node = graph[currentId];
    questionCount++;

    // Display question
    await chatShell.addMessage(node.prompt, 'bot', { delay: 500 });
    transcript.push({ sender: 'bot', content: node.prompt });

    // Wait for user selection
    const userChoice = await new Promise((resolve) => {
      chatShell.addOptions(node.options.map(opt => ({
        id: opt.id || opt.label,
        label: opt.label,
        callback: (choiceId, btn) => {
          const selectedOption = node.options.find(o => (o.id || o.label) === choiceId);
          resolve(selectedOption);
        }
      })));
    });

    // Add user response to transcript
    transcript.push({ sender: 'user', content: userChoice.label });
    await chatShell.addMessage(userChoice.label, 'user');

    // Get grade prefix
    const grade = userChoice.grade || 'incorrect';
    const prefix = GRADE_PREFIX_MAP[grade] || GRADE_PREFIX_MAP.incorrect;
    
    // Add grade prefix as bot response
    const gradeMessage = `<span class="kn-grade-prefix kn-grade-prefix--${grade}">${prefix}</span>`;
    const gradeBubble = await chatShell.addMessage(prefix, 'bot', { delay: 300 });
    
    // Add visual grade indicator
    if (gradeBubble) {
      const bubble = gradeBubble.querySelector('.kn-chat-bubble');
      if (bubble) {
        bubble.innerHTML = gradeMessage;
      }
    }
    
    transcript.push({ sender: 'bot', content: prefix, grade: grade });

    // Move to next node
    currentId = userChoice.nextId;

    // Check if this is the last question
    if (!currentId || !graph[currentId]) {
      // Final question - show placeholder response
      await chatShell.showTypingIndicator({ delay: 500, duration: 1000 });
      await chatShell.addMessage("Ok let's run through your answers...", 'bot');
      transcript.push({ sender: 'bot', content: "Ok let's run through your answers..." });
      break;
    }
  }

  // Return transcript for explainer
  return transcript;
}

/**
 * Run Free-Text quiz with hint system and question cap
 * @param {Object} params - { graph, startId, chatShell, maxQuestions, minHintChars }
 * @param {Object} graph - Quiz graph with nodes containing: { id, prompt, nextId, concepts, strengths, gaps }
 * @param {string} startId - Starting node ID
 * @param {ChatShell} chatShell - ChatShell instance
 * @param {number} maxQuestions - Maximum questions (default 2)
 * @param {number} minHintChars - Minimum characters before showing hint (default 40)
 */
async function runFreeText({ graph, startId, chatShell, maxQuestions = 2, minHintChars = 40 }) {
  if (!graph || !startId || !chatShell) {
    console.error('runFreeText: Missing required parameters');
    return { transcript: [], userResponses: [], questionCount: 0 };
  }

  const transcript = [];
  let currentId = startId;
  let questionCount = 0;
  const userResponses = [];

  // Process up to maxQuestions
  while (currentId && graph[currentId] && questionCount < maxQuestions) {
    const node = graph[currentId];
    questionCount++;
    
    // Use unique IDs to avoid conflicts
    const inputId = `freetext-input-${Date.now()}-${questionCount}`;
    const sendId = `freetext-send-${Date.now()}-${questionCount}`;
    const counterId = `freetext-counter-${Date.now()}-${questionCount}`;
    const hintId = `freetext-hint-${Date.now()}-${questionCount}`;

    // Display question
    await chatShell.addMessage(node.prompt, 'bot', { delay: 500 });
    transcript.push({ sender: 'bot', content: node.prompt });

    // Create free-text input area
    const inputArea = chatShell.inputArea;
    const inputHTML = `
      <div class="kn-freetext-area">
        <textarea 
          class="kn-freetext-input" 
          placeholder="Type your response here... (Shift+Enter for new line)"
          rows="4"
          id="${inputId}"
        ></textarea>
        <div class="kn-freetext-controls">
          <div class="kn-freetext-meta">
            <span class="kn-freetext-counter" id="${counterId}">0 chars</span>
            <span class="kn-freetext-hint" id="${hintId}" style="display:none;"></span>
          </div>
          <button class="kn-freetext-send" id="${sendId}" type="button">
            Send →
          </button>
        </div>
      </div>
    `;
    
    inputArea.innerHTML = inputHTML;
    
    // Wait a frame for DOM to update
    await new Promise(r => requestAnimationFrame(r));

    const textarea = document.getElementById(inputId);
    const sendBtn = document.getElementById(sendId);
    const counter = document.getElementById(counterId);
    const hintEl = document.getElementById(hintId);
    
    // Validate elements exist
    if (!textarea || !sendBtn) {
      console.error('runFreeText: Could not find input elements', { inputId, sendId });
      currentId = node.nextId;
      continue;
    }
    
    // Focus textarea for better UX
    textarea.focus();

    // Update character counter on input
    textarea.addEventListener('input', () => {
      const length = textarea.value.trim().length;
      if (counter) counter.textContent = `${length} chars`;
    });

    // Wait for user to submit - using a more robust pattern
    const userResponse = await new Promise((resolve) => {
      let attemptCount = 0;
      let hintShown = false;
      
      const handleSubmit = () => {
        const text = textarea.value.trim();
        attemptCount++;
        
        console.log('[FreeText] Submit attempt:', { attemptCount, textLength: text.length, minHintChars });

        // First attempt with short text - show encouraging hint
        if (attemptCount === 1 && text.length > 0 && text.length < minHintChars && !hintShown) {
          if (hintEl) {
            hintEl.textContent = `Great start! Try adding a bit more detail.`;
            hintEl.style.display = 'inline-block';
          }
          hintShown = true;
          return; // Give them another chance
        }

        // Accept any non-empty response on second attempt or if long enough
        if (text.length > 0) {
          sendBtn.disabled = true;
          textarea.disabled = true;
          sendBtn.textContent = 'Sent ✓';
          resolve(text);
          return;
        }
        
        // Empty text - show error hint
        if (hintEl) {
          hintEl.textContent = 'Please type a response first.';
          hintEl.style.display = 'inline-block';
          hintEl.style.color = '#ef4444';
        }
      };
      
      // Click handler
      sendBtn.addEventListener('click', handleSubmit);
      
      // Enter key handler (Shift+Enter for newline)
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      });
    });

    // Add user response to chat
    userResponses.push(userResponse);
    await chatShell.addMessage(userResponse, 'user');
    transcript.push({ sender: 'user', content: userResponse });

    // Show typing indicator for natural feel
    await chatShell.showTypingIndicator({ duration: 800 });

    // Move to next node
    currentId = node.nextId;
  }

  // After max questions reached - show transition message
  await chatShell.addMessage("Great responses! Let's review what you've shared...", 'bot');
  transcript.push({ sender: 'bot', content: "Great responses! Let's review what you've shared..." });

  // Return transcript and user responses for explainer
  return { transcript, userResponses, questionCount };
}

/**
 * Show explainer with fade animation after hiding chat shell
 * @param {ChatShell} chatShell - ChatShell instance
 * @param {Object} explainerData - Explainer content/audio data
 * @param {Array} transcript - Conversation transcript
 */
async function showExplainerWithTransition(chatShell, explainerData, transcript) {
  // Small fade animation
  const fadeOverlay = document.createElement('div');
  fadeOverlay.className = 'kn-fade-transition';
  fadeOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--knode-primary);
  `;
  fadeOverlay.textContent = 'Preparing your results...';
  document.body.appendChild(fadeOverlay);

  // Wait for fade animation
  await new Promise(resolve => setTimeout(resolve, 500));


  // COMPLETELY REPLACE chat shell with explainer view
  const observer = new MutationObserver(() => {
  const frame = document.querySelector('.kn-frame.kn-frame--chat');
  if (frame) {
    frame.style.display = 'none';
    observer.disconnect(); // stop watching once found
  }
});
observer.observe(document.body, { childList: true, subtree: true });
  
  const resultsView = document.getElementById('results-view');
  
  if (resultsView) {
  
    // Show explainer view in its place
    resultsView.style.display = 'block';
    resultsView.style.position = 'relative';
    resultsView.style.zIndex = '1';
    resultsView.classList.add('kn-fade-transition');
  }

  // Remove fade overlay
  fadeOverlay.remove();

  // Play explainer with transcript
  if (window.Explainer && window.Explainer.play) {
    await window.Explainer.play({ 
      content: explainerData, 
      transcript: transcript 
    });
  } else {
    // Fallback to existing player
    const player = ensurePlayer();
    if (player && explainerData) {
      player.playSequence(explainerData, 0);
    }
  }

  // After explainer completes, restore chat shell
  const onExplainerComplete = () => {
    if (chatContainer && resultsView) {
      // Hide explainer
      resultsView.style.display = 'none';
      // Show chat shell again
      chatContainer.style.display = 'block';
    }
  };

  // Wire up completion handler
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    const originalHandler = nextBtn.onclick;
    nextBtn.onclick = () => {
      onExplainerComplete();
      if (originalHandler) originalHandler();
    };
  }

  return onExplainerComplete;
}

// Export to global scope
window.runMCQ = runMCQ;
window.runFreeText = runFreeText;
window.showExplainerWithTransition = showExplainerWithTransition;
window.GRADE_PREFIX_MAP = GRADE_PREFIX_MAP;

</script>