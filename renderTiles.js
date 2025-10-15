<script> 
let currentIndex = 0;
let tileIndex = 0;
let data = [];
let userAnswers = [];
let typewriterTarget;
  
function renderTile(index) {
  const data = tileData[index];
  if (!data) return;

  if (data.contentType === "video") return renderVideoTile(data);
  if (data.contentType === "mcqQuiz") return renderQuizTile(data);
  if (data.contentType === "textQuiz") return renderTextQuizTile(data);
  if (data.contentType === "scenarioQuiz") return renderScenarioTile(data);
  if (data.contentType === "chatQuiz") return renderChatQuizTile(data);
}

  
 function renderVideoTile(data) {
 const container = document.getElementById("knodeTileContainer");
 console.log("tile called with:",data);
 
container.innerHTML = `
  <div class="knode-tile">
    <div class="video-wrapper">
      <div class="video-inner">

        <video id="tileVideo" class="knode-video" controls playsinline autoplay style="width: 95%; height: 95%; object-fit: cover;">
          <source src="${data.videoUrl}" type="video/mp4" />
        </video>

        <div class="pill-group">
          <span class="pill">${data.topic}</span>
          <span class="pill">${data.title}</span>
          <span class="pill duration">⏱ ${data.duration}</span>
        </div>

        <div class="cta-overlay" id="ctaOverlay" style="display: none;">
          <button id="nxtBtn" class="knode-btn">Let’s move on →</button>
          <button id="replayBtn" class="knode-btn ghost">Replay ⟳</button>
        </div>

      </div>
    </div>

    <div class="knoments-header" onclick="toggleKnoments()">📝 Knoments (click to open/close)</div>
    <div class="knoments-wrapper" id="knomentsWrapper">
      <div class="scene-selector" id="sceneButtons"></div>
      <div class="knoment-sticky-wrapper" id="knomentStickers"></div>
      <div class="summarise-options">
        <p><strong>Try a different summary format:</strong></p>
        <button class="summary-btn">ELI5</button>
        <button class="summary-btn">Sports Analogy</button>
        <button class="summary-btn">Pop Culture</button>
      </div>
    </div>
  </div>
`;

  const scenes = data.scenes;
  const sceneButtons = document.getElementById("sceneButtons");
  const stickers = document.getElementById("knomentStickers");
  Object.keys(scenes).forEach((sceneId, i) => {
    const btn = document.createElement("button");
    btn.className = `scene-btn ${i === 0 ? "active" : ""}`;
    btn.textContent = `Scene ${sceneId}`;
    btn.onclick = () => {
      document.querySelectorAll(".scene-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderKnoments(scenes[sceneId], stickers);
    };
    sceneButtons.appendChild(btn);
  });

  renderKnoments(scenes[1], stickers);

const video = document.getElementById("tileVideo");
const ctaOverlay = document.getElementById("ctaOverlay");
const replayBtn = document.getElementById("replayBtn");

video.onended = () => {
  ctaOverlay.style.display = "flex";
};

replayBtn.onclick = () => {
  ctaOverlay.style.display = "none";
  video.currentTime = 0;
  video.play();
};

 video.addEventListener("ended", () => {
   document.getElementById("nxtBtn").style.display = "flex";
    console.log("nextBtn Found and loaded");
  });
  
  

  document.getElementById("nxtBtn").onclick = () => {
    navigateToTile(tileIndex + 1);
  };
}


function renderKnoments(knomentArr, container) {
  container.innerHTML = "";
  knomentArr.forEach(text => {
    const div = document.createElement("div");
    div.className = "knoment";
    div.innerHTML = `<p>${text}</p><button class="copy-btn">Copy</button>`;
    container.appendChild(div);
  });
}

function toggleKnoments() {
  const el = document.getElementById("knomentsWrapper");
  el.style.display = el.style.display === "block" ? "none" : "block";
}


function renderQuizTile(data) {
  const container = document.getElementById("knodeTileContainer");

  container.innerHTML = `
    <div class="knode-tile full-screen-tile" id="quizTile">
 

  <div class="quiz-whiteboard">
   <div class="knode-pills overlay-pills">
    <span class="pill">${data.topic || ""}</span>
    <span class="pill">${data.title || "Quiz"}</span>
    <span class="pill duration">⏱ ${data.duration || "?"}</span>
  </div>
    <div id="quiz-app" class="quiz-app">
    
      <div id="quiz-header">
        <h2 id="quiz-name">${data.title || "Quiz Time"}</h2>
        <div id="progress-bar">
          <span id="progress-count">1 / ${(data.questions.length || 5)}</span>
          <div class="progress-track"><div id="progress-fill"></div></div>
        </div>
      </div>
      <div id="quiz-container"></div>
    </div>

    <div id="results-view" class="explainer-container" style="display:none;">
      <div class="float-icon" id="floatIcon">✔</div>
      <div class="float-xp" id="floatXP">+10XP</div>
      <div id="answer-status" class="answer-status"></div>
      <div id="typewriter"></div>

      <div class="next-controls" id="nextControls">
        <button id="next-btn" class="knode-btn" style="display:none;">Next Question</button>
        <button id="skipbtn" class="knode-btn">Skip Explainer →</button>
        <button id="speed-toggle" class="speed-toggle">Speed: 1x</button>
      </div>

      <div class="cta" id="cta">
        <button id="save-cta-btn" class="knode-btn" onclick="window.location.href='/log-in'">Save XP & Streak?</button>
        <button id="replay-cta-btn" class="knode-btn" onclick="replayFeedback()">Replay</button>
        <button id="nextBtn" class="overlay-next-btn">Let’s move on →</button>
      </div>

      <div id="audio-init" class="audio-init" style="display:none;">
        <button id="enable-audio">🔈 Tap to Enable Audio</button>
        <div id="confetti-lottie" class="confetti-lottie"></div>
      </div>

      <img src="https://cdn.prod.website-files.com/6821cff7a114d28d2d37eb72/6842d8a42693e55fa4d185c7_kno-character-teacher.png" alt="Kno Teacher" class="mascot" />
      <div id="tick-lottie" class="tick-lottie"></div>
    </div>
  </div>
</div>

  `;
  // === V1 anchors: must be GLOBAL so V1 methods can see them ===
window.typewriterTarget = document.getElementById('typewriter');
window.cta         = document.getElementById('cta');
window.floatIcon   = document.getElementById('floatIcon');
window.floatXP     = document.getElementById('floatXP');

console.log('[anchors]',
  !!window.typewriterTarget,
  !!window.cta,
  !!window.floatIcon,
  !!window.floatXP
);

  // ✅ Safely fire quiz logic after rendering
  if (data && Array.isArray(data.questions)) {
    initQuiz(data); // pass full data object to preserve quizId etc.
  } else {
    console.error("renderQuizTile: No valid questions found in data");
  }
}

let quizData = [];
let sequencePlayer = window.sequencePlayer || null;

function ensurePlayer() {
  if (!window.typewriterTarget) {
    console.warn('typewriterTarget not ready; call ensurePlayer() after results view is visible.');
    return null;
  }

  const needsRebuild =
    !sequencePlayer ||
    !sequencePlayer.typewriterManager?.target ||
    sequencePlayer.typewriterManager.target !== window.typewriterTarget;

  if (needsRebuild) {
    sequencePlayer = new SequencePlayer();
    window.sequencePlayer = sequencePlayer;

    const speedBtn = document.getElementById('speed-toggle');
    if (speedBtn) {
      speedBtn.onclick = () => {
        sequencePlayer.playbackSpeed = sequencePlayer.playbackSpeed === 1.0 ? 1.5 : 1.0;
        speedBtn.textContent = `Speed: ${sequencePlayer.playbackSpeed}x`;
      };
    }
  }
  return sequencePlayer;
}

function initQuiz(data) {
  console.log("initQuiz received:", data); // ← ADD THIS
  if (!data || !Array.isArray(data.questions)) {
    console.error("initQuiz error: data.questions is missing or not an array.");
    return;
  }

  quizData = data.questions;
  currentIndex = 0;
  userAnswers = [];
  renderQuestion();
}

function renderQuestion() {
  const quizContainer = document.getElementById("quiz-container");
  const q = quizData[currentIndex];

  quizContainer.innerHTML = `
    <div class="quiz-question-title">${q.question_title}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <div class="quiz-option" data-index="${i}">${opt}</div>
      `).join("")}
    </div>
    ${currentIndex > 0 ? '<button id="back-button">Back</button>' : ''}
  `;

  document.querySelectorAll(".quiz-option").forEach(option => {
    option.addEventListener("click", e => {
      const selectedIndex = parseInt(e.target.getAttribute("data-index"));
      userAnswers.push({ question_id: q.id, selected_option: selectedIndex });
      currentIndex++;
      if (currentIndex < quizData.length) {
        renderQuestion();
      } else {
        renderFinalScreen();
      }
    });
  });

  const backBtn = document.getElementById("back-button");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      currentIndex--;
      userAnswers.pop();
      renderQuestion();
    });
  }

  updateProgress();
}

function updateProgress() {
  const progressCountEl = document.getElementById("progress-count");
  const progressFillEl = document.getElementById("progress-fill");
  progressCountEl.textContent = `${Math.min(currentIndex + 1, quizData.length)} / ${quizData.length}`;
  progressFillEl.style.width = `${(currentIndex / quizData.length) * 100}%`;
}

function renderFinalScreen() {
  const quizContainer = document.getElementById("quiz-container");
 quizContainer.innerHTML = `
  <div class="quiz-final">
    <h3 class="quiz-final-heading">Now let’s see your results</h3>
    <div class="quiz-final-cta">
      <button class="knode-btn" type="button" id="quiz-submit">See My Results →</button>
    </div>
  </div>
`;
document.getElementById('quiz-submit')?.addEventListener('click', submitAnswers);

  updateProgress();
}

</script>