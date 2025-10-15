<script>

function submitAnswers() {
  const quizContainer = document.getElementById("quiz-container");
  const quizHeader    = document.getElementById("quiz-header");
  const quizApp       = document.getElementById("quiz-app");
  const resultsView   = document.getElementById("results-view");

  const submitEndpoint = "https://udpxwtntstojffxvzqxb.supabase.co/functions/v1/dynamic-handler";
  const quizId = "cf7b8565-58e1-4127-b297-1454a5098ce4";
  const username = localStorage.getItem('username');
  const anonID   = localStorage.getItem('anonymous_id');
  const submit_Date = new Date().toISOString().split("T")[0];

  // Show spinner
  quizContainer.innerHTML = '<div class="quiz-final"><h3>Generating feedback...</h3><div class="spinner"></div></div>';

  // Build payload
  const payload = { quiz_id: quizId, answers: userAnswers, submitDate: submit_Date };
  if (username) payload.user_id = username; else if (anonID) payload.anonymous_id = anonID;

  fetch(submitEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(result => {
    const rendered = result.response;
    if (!Array.isArray(rendered) || rendered.length === 0) {
      quizContainer.innerHTML = `<p>Sorry, we couldn’t generate your feedback. Please try again later.</p>`;
      return;
    }

    // Cache for replay
    window.cachedResults = rendered;

    // Swap to results view with transitions
applyExit(quizApp);
applyExit(quizHeader);
applyExit(quizContainer);
resultsView.style.display = 'block';
applyEnter(resultsView);

// Give the browser a tick to paint the new DOM
setTimeout(() => {
  // refresh anchors from the now-visible DOM
  window.typewriterTarget = document.getElementById("typewriter");
  window.floatIcon = document.getElementById("floatIcon");
  window.floatXP   = document.getElementById("floatXP");

  if (!window.typewriterTarget) {
    console.error("❌ Could not find #typewriter element");
    return;
  }

  // if an old player was bound to a different target, drop it
  if (window.sequencePlayer &&
      window.sequencePlayer.typewriterManager?.target !== window.typewriterTarget) {
    window.sequencePlayer = null;
  }

  const player = ensurePlayer();
  if (!player) return;

  player.stop();
  player.playSequence(rendered, 0);
}, 0);
  })
  .catch(err => {
    console.error("Error submitting quiz:", err);
    quizContainer.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
  });
}
// Configuration object - easily adjustable for audio-text sync
const sequenceConfig = {
  typewriterDelay: 50,           // ms between characters
  introDelay: 400,              // pause after intro message
  recapDelay: 500,              // delay before next result
  annotationDelay: 1000,         // ms between annotations
  floatIconDuration: 2000,       // how long float effects show
  explainerTextDelay: 200,       // delay before starting typewriter during explainer
  postRecapDelay: 300,           // extra delay after recap before annotations
  domUpdateDelay: 100,           // wait for DOM updates
};

// Audio Manager - handles all audio operations
class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.currentAudios = new Set();
  }
  async loadAudio(url) {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url);
    }
    const audio = new Audio(url);
    this.audioCache.set(url, audio); // cache early
    return new Promise((resolve, reject) => {
      const onLoad = () => {
        audio.removeEventListener('loadeddata', onLoad);
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
        resolve(audio);
      };
      const onError = (e) => {
        audio.removeEventListener('loadeddata', onLoad);
        audio.removeEventListener('canplaythrough', onLoad);
        audio.removeEventListener('error', onError);
        console.warn(`Failed to load audio: ${url}`, e);
        reject(e);
      };
      audio.addEventListener('loadeddata', onLoad);
      audio.addEventListener('canplaythrough', onLoad);
      audio.addEventListener('error', onError);
      audio.load();
    });
  }
  // This ensures all audio tags are iOS-unlocked
  async prewarmAudios(urls = []) {
    const unlockPromises = urls.map(async (url) => {
      const audio = await this.loadAudio(url);
      return audio.play().then(() => {
        audio.pause(); // stop it right away
        audio.currentTime = 0;
      }).catch(() => {}); // swallow autoplay errors
    });
    return Promise.all(unlockPromises);
  }
  async playAudio(url, speed = 1.0) {
    try {
      const audio = await this.loadAudio(url);
      audio.playbackRate = speed;
      this.currentAudios.add(audio);
      return new Promise((resolve) => {
        const onDone = () => {
          audio.removeEventListener('ended', onDone);
          audio.removeEventListener('knode-stop', onDone);
          this.currentAudios.delete(audio);
          resolve();
        };
        audio.addEventListener('ended', onDone, { once: true });
        audio.addEventListener('knode-stop', onDone, { once: true });
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.warn(`Failed to play audio: ${url}`, err);
          onDone();
        });
      });
    } catch (error) {
      console.warn(`Audio error for ${url}:`, error);
      return Promise.resolve();
    }
  }

  stopAll() {
    // Ensure all waiting playAudio promises resolve
    this.currentAudios.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.dispatchEvent(new Event('knode-stop'));
      } catch (_) {}
    });
    this.currentAudios.clear();
  }
}
//typewrite manager func
class TypewriterManager {
  constructor(target, delay = 50) { 
    this.target = target; 
    this.delay = delay; 
    this.currentTypewriter = null;
    this.isStopped = false;
    this.pendingResolve = null;
  }

  async typeContent(content) {
    if (!this.target) { throw new Error('TypewriterManager: target is null'); }
    this.target.innerHTML = "";
    this.isStopped = false;
    
    return new Promise((resolve) => {
      this.pendingResolve = () => { try { resolve(); } catch(_) {} finally { this.pendingResolve = null; } };
      if (this.isStopped) {
        this.pendingResolve();
        return;
      }
      
      this.currentTypewriter = new Typewriter(this.target, { 
        loop: false, 
        delay: this.delay,
        cursor: '|',
        cursorClassName: 'typewriter-cursor'
      });
      
      this.currentTypewriter
        .typeString(content)
        .callFunction(() => {
          if (!this.isStopped && this.pendingResolve) this.pendingResolve();
        })
        .start();
    });
  }
  
  stop() {
    this.isStopped = true;
    if (this.currentTypewriter) {
      this.currentTypewriter.stop();
      this.currentTypewriter = null;
    }
    if (this.pendingResolve) {
      this.pendingResolve();
    }
  }
      
 async appendContent(content) {
    // Append content to existing text
    return new Promise((resolve) => {
      this.pendingResolve = () => { try { resolve(); } catch(_) {} finally { this.pendingResolve = null; } };
      const typewriter = new Typewriter(this.target, {
        loop: false,
        delay: this.delay
      });
     
      typewriter
        .typeString(content)
        .callFunction(() => { if (this.pendingResolve) this.pendingResolve(); })
        .start();
    });
  }

  async typeIntro(message, delay) {
    this.target.innerHTML = "";
   
    return new Promise((resolve) => {
      this.pendingResolve = () => { try { resolve(); } catch(_) {} finally { this.pendingResolve = null; } };
      const typewriter = new Typewriter(this.target, {
        loop: false,
        delay: this.delay
      });
     
      typewriter
        .typeString(message)
        .pauseFor(delay)
        .callFunction(() => { if (this.pendingResolve) this.pendingResolve(); })
        .start();
    });
  }
}


// Annotation Manager - handles highlight annotations
class AnnotationManager {
  constructor(target) {
    this.target = target;
    this.annotations = [];
    this.rangeMap = new Map(); // Store text ranges for resize handling
    this.resizeObserver = null;
    this.setupResizeObserver();
  }
 
  async annotateHighlights(highlights, delay = 1100) {
    // Clear previous annotations
    this.clearAnnotations();
   
    if (!highlights || highlights.length === 0) {
      return;
    }
   
    let html = this.target.innerHTML;
   
    // Apply spans first - process each highlight
    const questionEnd = html.indexOf('\n\n');
		if (questionEnd !== -1) {
 		 const questionPart = html.substring(0, questionEnd + 4); // Keep question + spacing
		  let scriptPart = html.substring(questionEnd + 4); // Only annotate script part
 
  // Apply annotations to script part only
  highlights.forEach((obj, idx) => {
    const phrase = obj.text;
    if (!phrase) return;
   
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
   
    if (scriptPart.match(regex)) {
      scriptPart = scriptPart.replace(regex, `<span class="annotate-target" id="span${idx}">${phrase}</span>`);
    } else {
      console.warn(`Could not find text to annotate: "${phrase}"`);
    }
  });
 
  html = questionPart + scriptPart;
} else {
  // Fallback to original logic if no question found
  highlights.forEach((obj, idx) => {
    const phrase = obj.text;
    if (!phrase) return;
   
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
   
    if (html.match(regex)) {
      html = html.replace(regex, `<span class="annotate-target" id="span${idx}">${phrase}</span>`);
    } else {
      console.warn(`Could not find text to annotate: "${phrase}"`);
    }
  });
}

   
    this.target.innerHTML = html;
   
    // Wait for DOM to update
    await this.delay(100);
   
    // Create and show annotations
    for (let idx = 0; idx < highlights.length; idx++) {
      const obj = highlights[idx];
      const span = document.getElementById(`span${idx}`);
     
      if (!span) {
        console.warn(`Could not annotate "${obj.text}" – span not found in DOM`);
        continue;
      }
     
      try {
        // Parse color properly
        let color = '#f28c5b'; // default
        if (obj.color) {
          const colorPart = obj.color.split('_')[0];
          color = colorPart.startsWith('#') ? colorPart : `#${colorPart}`;
        }
       
        const annotation = RoughNotation.annotate(span, {
          type: obj.annotationType === 'box' ? 'box' : obj.annotationType || 'underline',
          color: color,
          padding: 4,
          iterations: 2,
          animate: true
        });
       
        this.annotations.push(annotation);
       
        // Show annotation with delay
        setTimeout(() => {
          annotation.show();
        }, delay * idx);
       
      } catch (error) {
        console.error(`Error creating annotation for "${obj.text}":`, error);
      }
    }
  }
 
  clearAnnotations() {
    this.annotations.forEach(annotation => {
      try {
        annotation.hide();
      } catch (e) {
        // Annotation might already be destroyed
      }
    });
    this.annotations = [];
  }
  
  
 
  // Helper method for debugging
  debugAnnotations() {
    console.log('🐛 Annotation Debug Info:');
    console.log('RoughNotation available:', typeof RoughNotation !== 'undefined');
    console.log('Target element:', this.target);
    console.log('Target HTML length:', this.target.innerHTML.length);
   
    const spans = this.target.querySelectorAll('.annotate-target');
    console.log('Found annotation spans:', spans.length);
    spans.forEach((span, idx) => {
      console.log(`  Span ${idx}: "${span.textContent}" (id: ${span.id})`);
    });
  }
 
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncAnnotations();
      });
      this.resizeObserver.observe(this.target);
    }
  }
  
  syncAnnotations() {
    // Re-sync annotations after resize
    this.annotations.forEach(annotation => {
      try {
        annotation.hide();
        annotation.show();
      } catch (e) {
        console.warn('Error syncing annotation:', e);
      }
    });
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.clearAnnotations();
  }
}

// Main Sequence Player - orchestrates everything
class SequencePlayer {
  constructor(config = {}) {
    this.config = { ...sequenceConfig, ...config };
    this.hasShownIntro = false;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1.0;
    this.skipRequested = false;
    this.activeTimers = new Set();

    this.audioManager      = new AudioManager();
    this.typewriterManager = new TypewriterManager(window.typewriterTarget, this.config.typewriterDelay);
    this.annotationManager = new AnnotationManager(window.typewriterTarget);
    
    // Feature flags
    this.enableAnimations = window.ENABLE_ANIMATIONS !== false;
    this.enableChatStyle = window.ENABLE_CHAT_STYLE === true;
  }
  bindGlobalSkip() {
    const skipBtn = document.getElementById('skipbtn');
    if (!skipBtn) return;
    if (skipBtn.dataset && skipBtn.dataset.bound === 'true') {
      // already bound for this DOM instance
      skipBtn.style.display = 'inline-block';
      return;
    }
    const globalSkipHandler = () => {
      this.skipRequested = true;
      this.clearAllTimers();
      this.audioManager.stopAll();
      this.typewriterManager.stop();
      this.annotationManager.clearAnnotations();
    };
    skipBtn.addEventListener('click', globalSkipHandler);
    // Make sure it's visible during playback
    skipBtn.style.display = 'inline-block';
    if (!skipBtn.dataset) skipBtn.dataset = {};
    skipBtn.dataset.bound = 'true';
  }
waitForNextButton() {
  return new Promise(resolve => {
    const btn = document.getElementById("next-btn");
    const skipBtn = document.getElementById("skipbtn");
    
    if (!btn) {
      resolve();
      return;
    }
    
    btn.style.display = "inline-block";
    if (skipBtn) skipBtn.style.display = "inline-block";
    // Animate buttons in
    try { applyEnter(btn); } catch(_) {}
    try { if (skipBtn) applyEnter(skipBtn); } catch(_) {}
    
    const handler = () => {
      btn.removeEventListener("click", handler);
      if (skipBtn) skipBtn.removeEventListener("click", skipHandler);
      try { applyExit(btn); } catch(_) { btn.style.display = "none"; }
      try { if (skipBtn) applyExit(skipBtn); } catch(_) { if (skipBtn) skipBtn.style.display = "none"; }
      // iOS audio unlock on user gesture
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const silentAudio = new Audio("https://cdn.jsdelivr.net/gh/anars/blank-audio/1-second-of-silence.mp3");
        silentAudio.play().then(() => {
          console.log(":large_green_circle: Silent audio successfully played to unlock iOS");
          silentAudio.pause();
          silentAudio.currentTime = 0;
        }).catch(e => {
          console.warn(":red_circle: Silent audio failed:", e);
        });
      }
      resolve();
    };
    
    const skipHandler = () => {
      this.skipRequested = true;
      this.clearAllTimers();
      this.audioManager.stopAll();
      this.typewriterManager.stop();
      this.annotationManager.clearAnnotations();
      handler();
    };
    
    btn.addEventListener("click", handler);
    if (skipBtn) skipBtn.addEventListener("click", skipHandler);
  });
}

showLottieTick() {
  if (!window.lottie || !document.getElementById('tick-lottie')) return;
  const container = document.getElementById('tick-lottie');
  container.style.display = 'block';
  const animation = lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'https://lottie.host/f33d756c-3737-4340-a367-bbdd3217ba65/XHYDBaVL0p.lottie' // :white_tick: Replace with your tick JSON
  });
  setTimeout(() => {
    container.style.display = 'none';
    animation.destroy();
  }, this.config.floatIconDuration || 2000);
}

async playSequence(results, index = 0) {
  if (!this.validateResults(results)) return;
  this.isPlaying = true;
  this.currentIndex = index;
  try {
    // ensure skip is bound and visible while we play
    this.bindGlobalSkip();
    const skipBtn = document.getElementById('skipbtn');
    if (skipBtn) skipBtn.style.display = 'inline-block';
    if (index >= results.length) {
      this.showCTA();
      this.isPlaying = false;
      return;
    }
    await this.playResult(results[index]);
      if (this.skipRequested) {
        // jump immediately to next
        const nextIndex = index + 1;
        this.skipRequested = false;
        return this.playSequence(results, nextIndex);
      }
      await this.delay(this.config.recapDelay);
    const isLast = index === results.length - 1;
  if (!isLast) {
      await this.waitForNextButton();
      // Ensure skip proceeds and flag doesn't leak to next step
      const nextIndex = index + 1;
      this.skipRequested = false;
      return this.playSequence(results, nextIndex);
    } else {
      // No button shown on final step, just end
      this.showCTA(); // or trigger auto scroll / continue UX
      this.isPlaying = false;
    }
  } catch (error) {
    console.error('Error in playSequence:', error);
    this.isPlaying = false;
  }
}

async playResult(result) {
  const {
    intro_url,
    explainer_url,
    recap_url,
    highlights,
    question_text,
    intro_text,
    script_text,
    answer_type,
    answer_text
  } = result;
  // Reset previous markers
  //document.getElementById("correct-answer-block").style.display = "none";
  //document.getElementById("incorrect-answer-block").style.display = "none";
	document.getElementById("typewriter").innerHTML = "";

  try {
    // 1. Intro Audio + Type question and intro
    const questionContent = this.formatQuestionContent({ question_text, intro_text, answer_text });
    
    const introAudioPromise = intro_url ? this.audioManager.playAudio(intro_url, this.playbackSpeed) : Promise.resolve();
    const introTypingPromise = this.typewriterManager.typeContent(questionContent);
    
         const statusEl = document.getElementById("answer-status");
statusEl.style.display = "block";
if (answer_type === "correct") {
  statusEl.textContent = "You got this correct! ✔";
  statusEl.style.color = "#1b5728";
} else {
  statusEl.textContent = "You got this incorrect ✖";
  statusEl.style.color = "#891717";
};

    await Promise.all([introAudioPromise, introTypingPromise]);
    if (this.skipRequested) return; // Exit early if skip requested

statusEl.style.display = "none";
statusEl.textContent = "";


    // 2. Delay then Explainer Audio + Type explainer
    await this.delay(this.config.explainerDelay || 400);
    if (this.skipRequested) return; // Exit early if skip requested
    
    const explainerAudioPromise = explainer_url ? this.audioManager.playAudio(explainer_url,this.playbackSpeed) : Promise.resolve();
    const explainerTypingPromise = this.typewriterManager.typeContent(script_text);
    await Promise.all([explainerAudioPromise, explainerTypingPromise]);
    if (this.skipRequested) return; // Exit early if skip requested
    
    // 3. If correct, show float effects

 
    // 4. Delay and then play recap audio with synced highlight annotation
    await this.delay(this.config.recapDelay || 600);
    if (this.skipRequested) return; // Exit early if skip requested
    
       // 3. Play recap audio and show annotations in parallel
if (recap_url && highlights && highlights.length > 0) {
  this.showFloatEffects();
  
  // Start both recap audio and annotations at the same time
  await Promise.all([
    this.audioManager.playAudio(recap_url,this.playbackSpeed),
    this.delay(this.config.postRecapDelay)
      .then(() => this.annotationManager.annotateHighlights(highlights, this.config.annotationDelay))
  ]);
} else if (recap_url) {
  // Just play recap if no annotations
  await this.audioManager.playAudio(recap_url);
} else if (highlights && highlights.length > 0) {
  // Just show annotations if no recap
  this.showFloatEffects();
  await this.annotationManager.annotateHighlights(highlights, this.config.annotationDelay);
}
     
    } catch (error) {
      console.error('Error playing result:', error);
      // Continue to next result even if this one fails
    }
  }
  
formatQuestionContent(result) {
  const { question_text, answer_text } = result;
  let content = '';
  if (question_text) {
    content += `<strong>Q:</strong> ${question_text}\n\n`;
  }
  if (answer_text) {
    content += `Your answer: ${answer_text}\n\n`;
  }
  return content;
}

formatScriptContent(result) {
  const { script_text } = result;
  return script_text ? script_text : '';
}

// Keep this for backward compatibility if needed elsewhere
formatContent(result) {
  return this.formatQuestionContent(result) + this.formatScriptContent(result);
}

 
  showFloatEffects() {
    if (typeof floatIcon !== 'undefined' && typeof floatXP !== 'undefined') {
      floatIcon.style.opacity = '0';
      floatXP.style.opacity = '0';
     
      setTimeout(() => {
        floatIcon.style.opacity = '0';
        floatXP.style.opacity = '0';
      }, this.config.floatIconDuration);
    }
  }
 
showCTA() {
  // Get elements safely
  const cta          = document.querySelector('#results-view .cta') || document.getElementById('cta');
  const nxtControls  = document.querySelector('#results-view .next-controls') || document.getElementById('nextControls');
  const nxtButton    = document.getElementById('nextBtn');
  const replayButton = document.getElementById('replay-cta-btn');

  if (!cta) {
    console.warn('CTA container not found.');
    return;
  }

  // Hide nav controls if present with animation
  if (nxtControls) {
    try { applyExit(nxtControls); } catch(_) { nxtControls.style.display = 'none'; }
  }

  // Show CTA section with animation
  cta.style.display = 'block';
  try { applyEnter(cta); } catch(_) {}

  // (Optional) wire up replay
  if (replayButton) {
    replayButton.onclick = () => {
      cta.style.display = 'none';
      const player = ensurePlayer();
      if (!player) return;
      player.stop();
      player.playSequence(window.cachedResults || [], 0);
    };
  }

  // (Optional) wire up “Let’s move on”
  if (nxtButton) {
    nxtButton.onclick = () => {
      navigateToTile(tileIndex + 1);
    };
  }
}


 
  validateResults(results) {
    if (!Array.isArray(results)) {
      console.warn("Invalid results passed to playSequence:", results);
      return false;
    }
   
    if (results.length === 0) {
      console.warn("Empty results array passed to playSequence");
      return false;
    }
   
    return true;
  }
 
  // Timer management for skip functionality
  addTimer(timerId) {
    this.activeTimers.add(timerId);
  }
  
  removeTimer(timerId) {
    this.activeTimers.delete(timerId);
  }
  
  clearAllTimers() {
    this.activeTimers.forEach(timerId => {
      clearTimeout(timerId);
      clearInterval(timerId);
    });
    this.activeTimers.clear();
  }
  
  // Enhanced delay with skip support
  async delay(ms) {
    if (this.skipRequested) return Promise.resolve();
    
    return new Promise(resolve => {
      const timerId = setTimeout(() => {
        this.removeTimer(timerId);
        if (!this.skipRequested) resolve();
      }, ms);
      this.addTimer(timerId);
    });
  }

  // Utility methods for debugging and control
  stop() {
    this.isPlaying = false;
    this.skipRequested = true;
    this.clearAllTimers();
    this.audioManager.stopAll();
    this.typewriterManager.stop();
    this.annotationManager.clearAnnotations();
  }

  debugAnnotations() {
    this.annotationManager.debugAnnotations();
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.typewriterManager.delay = this.config.typewriterDelay;
  }
}


function replayFeedback() {
if (!window.cachedResults || !Array.isArray(window.cachedResults)) {
console.warn("No cached results found.");
return;
}
const saveButton = document.getElementById("save-cta-btn");
const replayButton = document.getElementById("replay-cta-btn");
const nxtControls  = document.querySelector('#results-view .next-controls') || document.getElementById('nextControls');
saveButton.style.display = 'none';
replayButton.style.display ='none';
nxtControls.style.display = 'block';


sequencePlayer.stop();
sequencePlayer.playSequence(window.cachedResults,0);

}
// Timings
// sequencePlayer.updateConfig({
//   explainerTextDelay: 500,  // Start text 500ms after audio
//   annotationDelay: 800,     // Faster annotations
//   postRecapDelay: 1000      // Longer pause before annotations
// });

// Debugger annotation issues:
// sequencePlayer.debugAnnotations();
renderTile(0);
// Animate in first tile on load
try {
  const _c = document.getElementById('knodeTileContainer');
  if (_c && _c.firstElementChild) {
    _c.firstElementChild.style.display = 'block';
    applyEnter(_c.firstElementChild);
  }
} catch(_) {}

</script>