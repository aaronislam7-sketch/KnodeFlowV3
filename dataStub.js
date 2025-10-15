<script src="https://cdn.jsdelivr.net/npm/typewriter-effect@2.18.0/dist/core.js"></script>
<script src="https://unpkg.com/rough-notation/lib/rough-notation.iife.js"></script>

<script>
// Feature Flags
window.ENABLE_ANIMATIONS = true;
window.ENABLE_CHAT_STYLE = true;

console.log("this Script has started running");

// Simple section transition helpers
function applyEnter(el) {
  if (!el) return;
  if (window.ENABLE_ANIMATIONS === false) { el.style.display = 'block'; return; }
  el.style.display = el.style.display || 'block';
  el.classList.add('transition-fade', 'section-enter');
  requestAnimationFrame(() => {
    el.classList.add('section-enter-active');
    el.classList.remove('section-enter');
  });
  setTimeout(() => {
    el.classList.remove('section-enter-active', 'transition-fade');
  }, 350);
}

function applyExit(el) {
  if (!el) return;
  if (window.ENABLE_ANIMATIONS === false) { el.style.display = 'none'; return; }
  el.classList.add('transition-fade', 'section-exit');
  requestAnimationFrame(() => {
    el.classList.add('section-exit-active');
    el.classList.remove('section-exit');
  });
  setTimeout(() => {
    el.classList.remove('section-exit-active', 'transition-fade');
    el.style.display = 'none';
  }, 300);
}

// Swap tile helper: animate out old, in new
function navigateToTile(nextIndex) {
  const container = document.getElementById('knodeTileContainer');
  if (!container) { return renderTile(nextIndex); }
  const current = container.firstElementChild;
  if (current) {
    applyExit(current);
    setTimeout(() => {
      // Render next and animate in
      tileIndex = nextIndex;
      renderTile(tileIndex);
      const newChild = container.firstElementChild;
      if (newChild) {
        newChild.style.display = 'block';
        applyEnter(newChild);
      }
    }, 320);
  } else {
    tileIndex = nextIndex;
    renderTile(tileIndex);
    const newChild = container.firstElementChild;
    if (newChild) applyEnter(newChild);
  }
}

const tileData = [
  {
    contentType: "video",
    title: "Video 1: SaaS vs IaaS",
    topic: "Cloud Fundamentals",
    duration: "1m 20s",
    videoUrl: "https://cdn.pixabay.com/video/2024/06/17/217122_large.mp4",
    scenes: {
      1: ["SaaS is like Netflix – just click and use.", "No installation needed.", "Perfect for simplicity."],
      2: ["IaaS is like renting a house.", "You manage most components.", "Great for developers."],
      3: ["SaaS = Easy, IaaS = Flexible.", "Use case determines choice."]
    }
  },

  {
    contentType: "chatQuiz",
    title: "Customer Chat: Cloud Service Help",
    topic: "Cloud Fundamentals",
    duration: "~3 min",
    messages: [
      { type: "bot", content: "Hi! I'm looking for help choosing a cloud service for my startup." },
      { type: "bot", content: "We're building a simple web app and want to focus on coding, not infrastructure." },
      { type: "bot", content: "What would you recommend?" }
    ],
    options: [
      { id: "saas", label: "I'd recommend SaaS - it's perfect for simplicity" },
      { id: "iaas", label: "Go with IaaS - you'll have more control" },
      { id: "both", label: "Consider using both depending on your needs" }
    ],
    branches: {
      saas: [
        {
          question_text: "Recommended SaaS for the startup",
          answer_text: "I'd recommend SaaS - it's perfect for simplicity",
          answer_type: "correct",
          intro_text: "Great choice! Let's see why this works well.",
          script_text: "SaaS is ideal here because the customer wants to focus on coding, not infrastructure. With SaaS, they get instant setup, automatic updates, and predictable costs - exactly what a startup needs to move fast.",
          intro_url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/1-second-of-silence.mp3",
          explainer_url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/1-second-of-silence.mp3",
          recap_url: "https://cdn.jsdelivr.net/gh/anars/blank-audio/1-second-of-silence.mp3",
          highlights: [
            { text: "focus on coding", annotationType: "underline", color: "f28c5b" },
            { text: "instant setup", annotationType: "underline", color: "f28c5b" },
            { text: "predictable costs", annotationType: "underline", color: "f28c5b" }
          ]
        }
      ],
      iaas: [
        {
          question_text: "Recommended IaaS for the startup",
          answer_text: "Go with IaaS - you'll have more control",
          answer_type: "incorrect",
          intro_text: "Let's think about this choice...",
          script_text: "While IaaS offers control, it requires managing infrastructure - servers, networking, security patches. For a startup wanting to focus on coding, this adds complexity and overhead they may not need yet. SaaS would better match their 'focus on coding, not infrastructure' goal.",
          intro_url: "https://cdn.example.com/audio/chat-intro2.mp3",
          explainer_url: "https://cdn.jsndelivr.net/gh/anars/blank-audio/2-seconds-of-silence.mp3",
          recap_url: "https://cdn.example.com/audio/chat-recap2.mp3",
          highlights: [
            { text: "managing infrastructure", annotationType: "underline", color: "f28c5b" },
            { text: "adds complexity", annotationType: "underline", color: "f28c5b" },
            { text: "focus on coding", annotationType: "underline", color: "f28c5b" }
          ]
        }
      ],
      both: [
        {
          question_text: "Suggested using both services",
          answer_text: "Consider using both depending on your needs",
          answer_type: "correct",
          intro_text: "Interesting approach! Let's explore this.",
          script_text: "This shows good nuanced thinking. Many companies do use hybrid approaches - SaaS for standard tools like email and CRM, while using IaaS for custom applications. For this specific startup though, starting with pure SaaS would reduce initial complexity.",
          intro_url: "https://cdn.example.com/audio/chat-intro3.mp3",
          explainer_url: "https://cdn.example.com/audio/chat-explainer3.mp3",
          recap_url: "https://cdn.example.com/audio/chat-recap3.mp3",
          highlights: [
            { text: "hybrid approaches", annotationType: "underline", color: "f28c5b" },
            { text: "starting with pure SaaS", annotationType: "underline", color: "f28c5b" },
            { text: "reduce initial complexity", annotationType: "underline", color: "f28c5b" }
          ]
        }
      ]
    }
  },

  {
    contentType: "mcqQuiz",     // make sure your dispatcher handles this!
    title : "Let's Quiz!",
    topic : "Understanding SaaS",
    duration: "~2–3 min",
    quizDate: {
      id: "cf7b8565-58e1-4127-b297-1454a5098ce4",
      quiz_id: "",
      created_at: 1752601591427
    },
    questions: [
      {
        id: "8da9a609-e151-4c47-b6a5-b5b2ac19bcd5",
        question_id: 1,
        question_title: "What does SaaS stand for?",
        options: ["Software as a Service","Server and Storage","System as a Solution","Service and Support"],
        correct_answer_index: 0
      },
      {
        id: "77814806-9f3b-48fa-ba05-3b30bbcc75f7",
        question_id: 2,
        question_title: "Which of these is a key benefit of cloud computing?",
        options: ["Higher electricity usage","On-premise setup","Scalability","Manual backups"],
        correct_answer_index: 2
      },
      {
        id: "ae590d6b-a9ab-4083-a051-198e5a6b121b",
        question_id: 3,
        question_title: "What is the primary purpose of a cloud provider?",
        options: ["To sell hardware","To manage local servers","To provide on-demand computing resources","To build websites"],
        correct_answer_index: 2
      },
      {
        id: "27afe5b9-f6c7-4bf8-b8f4-2aa2ca5c36b0",
        question_id: 4,
        question_title: "Which one is an example of IaaS?",
        options: ["Google Docs","Amazon EC2","Dropbox","Outlook.com"],
        correct_answer_index: 1
      },
      {
        id: "474e4a04-0154-48d6-b27c-fcc095a15303",
        question_id: 5,
        question_title: "Cloud computing is best described as?",
        options: ["Static hosting","On-demand resource delivery","Buying physical servers","Unlimited bandwidth"],
        correct_answer_index: 1
      }
    ]
  },

  // ==================== NEW QUIZ MODES ====================
  
  // MCQ Branching Mode Example
  {
    contentType: "chatQuiz",
    mode: "chatmcq",
    title: "Cloud Concepts Quiz",
    topic: "Cloud Fundamentals",
    duration: "~2 min",
    graph: {
      "q1": {
        id: "q1",
        prompt: "What does SaaS stand for?",
        options: [
          {
            label: "Software as a Service",
            grade: "correct",
            nextId: "q2"
          },
          {
            label: "Storage as a Service",
            grade: "incorrect",
            nextId: "q2"
          },
          {
            label: "System as a Service",
            grade: "partial",
            nextId: "q2"
          }
        ]
      },
      "q2": {
        id: "q2",
        prompt: "Which is a primary benefit of cloud computing?",
        options: [
          {
            label: "Physical ownership of servers",
            grade: "incorrect",
            nextId: "q3"
          },
          {
            label: "Scalability and flexibility",
            grade: "correct",
            nextId: "q3"
          },
          {
            label: "Manual software updates",
            grade: "incorrect",
            nextId: "q3"
          }
        ]
      },
      "q3": {
        id: "q3",
        prompt: "Azure Functions is an example of which service model?",
        options: [
          {
            label: "SaaS",
            grade: "incorrect",
            nextId: null
          },
          {
            label: "PaaS (Serverless)",
            grade: "correct",
            nextId: null
          },
          {
            label: "IaaS",
            grade: "partial",
            nextId: null
          }
        ]
      }
    },
    startId: "q1",
    explainer: [
      {
        question_text: "Cloud Concepts Quiz Review",
        answer_text: "Your quiz responses",
        answer_type: "summary",
        intro_text: "Great work! Let's review your answers.",
        script_text: "SaaS stands for Software as a Service - it's the delivery model where applications run in the cloud. Key benefits include scalability and flexibility - you can scale resources up or down as needed. Azure Functions is a serverless compute service, which falls under PaaS (Platform as a Service). These concepts form the foundation of modern cloud architecture.",
        intro_url: "",
        explainer_url: "",
        recap_url: "",
        highlights: [
          { text: "Software as a Service", annotationType: "box", color: "10b981" },
          { text: "scalability and flexibility", annotationType: "underline", color: "f28c5b" },
          { text: "serverless compute", annotationType: "circle", color: "8b5cf6" }
        ]
      }
    ]
  },

  // Free-Text Mode Example
  {
    contentType: "chatQuiz",
    mode: "chatfreetext",
    title: "Cloud Understanding Check",
    topic: "Cloud Fundamentals",
    duration: "~4 min",
    graph: {
      "q1": {
        id: "q1",
        prompt: "In your own words, explain the main benefits of using cloud computing for a business.",
        nextId: "q2",
        concepts: ["scalability", "cost-efficiency", "accessibility", "maintenance"]
      },
      "q2": {
        id: "q2",
        prompt: "Describe a scenario where you would choose serverless architecture (like Azure Functions) over traditional server hosting.",
        nextId: null,
        concepts: ["event-driven", "auto-scaling", "cost-optimization", "microservices"]
      }
    },
    startId: "q1",
    maxQuestions: 2,
    minHintChars: 40,
    explainer: [
      {
        question_text: "Your Free Response Analysis",
        answer_text: "Analyzing your understanding",
        answer_type: "analysis",
        intro_text: "Let's break down your responses.",
        script_text: "Based on your answers, you've demonstrated understanding of key cloud concepts. Strong areas include recognizing scalability and cost benefits. For serverless architecture, event-driven workloads and automatic scaling are crucial advantages. Consider exploring how serverless reduces operational overhead and enables pay-per-execution pricing. These patterns are widely used in modern cloud-native applications.",
        intro_url: "",
        explainer_url: "",
        recap_url: "",
        highlights: [
          { text: "scalability and cost benefits", annotationType: "underline", color: "10b981" },
          { text: "event-driven workloads", annotationType: "box", color: "f28c5b" },
          { text: "pay-per-execution", annotationType: "circle", color: "8b5cf6" },
          { text: "operational overhead", annotationType: "underline", color: "f59e0b" }
        ]
      }
    ],
    analyzeResponses: function(responses) {
      // Analyze user responses for key concepts
      const keywords = {
        business: ["scalability", "scale", "cost", "flexible", "accessibility", "maintenance", "efficiency"],
        serverless: ["event", "automatic", "scaling", "cost", "microservice", "function", "trigger", "pay"]
      };
      
      const response1 = responses[0] ? responses[0].toLowerCase() : "";
      const response2 = responses[1] ? responses[1].toLowerCase() : "";
      
      const mentioned1 = keywords.business.filter(kw => response1.includes(kw));
      const mentioned2 = keywords.serverless.filter(kw => response2.includes(kw));
      
      let analysis = "";
      
      if (mentioned1.length > 0) {
        analysis += `Great! You mentioned: ${mentioned1.join(", ")}. `;
      }
      
      if (mentioned2.length > 0) {
        analysis += `For serverless, you covered: ${mentioned2.join(", ")}. `;
      }
      
      if (mentioned1.length < 2) {
        analysis += "Consider exploring more benefits like cost-efficiency and reduced maintenance. ";
      }
      
      if (mentioned2.length < 2) {
        analysis += "For serverless, think about event-driven patterns and auto-scaling advantages.";
      }
      
      return analysis || "You've provided thoughtful responses. Let's review the key concepts together.";
    }
  }
];
</script>