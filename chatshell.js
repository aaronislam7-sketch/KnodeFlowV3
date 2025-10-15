<!-- Polish Framework Scripts - Embedded for Webflow compatibility -->
<script>
/**
 * KNODE LEARNING FLOW - COMPLETE EMBEDDABLE JAVASCRIPT
 * Includes: Animations, ChatShell, and Typewriter
 * NO external dependencies - everything is self-contained
 */

(function(window) {
  'use strict';

  // ==================== ANIMATIONS MODULE ====================
  
  const isAnimationEnabled = () => {
    if (window.ENABLE_POLISH_ANIMATIONS === false) return false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion;
  };

  const ANIMATION_CONFIG = {
    duration: {
      fast: 180,
      medium: 240,
      slow: 320
    },
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    easingIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  function slideFadeEnter(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.medium,
      easing = ANIMATION_CONFIG.easing,
      distance = 16,
      delay = 0
    } = options;

    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transform = `translateY(${distance}px)`;
      element.style.transition = 'none';
      element.offsetHeight;
      element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      }, delay);
    });
  }

  function slideFadeExit(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.display = 'none';
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.fast,
      easing = ANIMATION_CONFIG.easing,
      distance = -16,
      delay = 0
    } = options;

    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = `translateY(${distance}px)`;
        setTimeout(() => {
          element.style.display = 'none';
          element.style.transition = '';
          resolve();
        }, duration);
      }, delay);
    });
  }

  function scaleFadeEnter(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.medium,
      easing = ANIMATION_CONFIG.easing,
      scale = 0.95,
      delay = 0
    } = options;

    return new Promise(resolve => {
      element.style.opacity = '0';
      element.style.transform = `scale(${scale})`;
      element.style.transition = 'none';
      element.offsetHeight;
      element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      }, delay);
    });
  }

  function scaleFadeExit(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.display = 'none';
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.fast,
      easing = ANIMATION_CONFIG.easing,
      scale = 0.95,
      delay = 0
    } = options;

    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = `scale(${scale})`;
        setTimeout(() => {
          element.style.display = 'none';
          element.style.transition = '';
          resolve();
        }, duration);
      }, delay);
    });
  }

  function staggerReveal(elements, options = {}) {
    if (!elements || elements.length === 0) return Promise.resolve();
    if (!isAnimationEnabled()) {
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.medium,
      easing = ANIMATION_CONFIG.easing,
      stagger = 60,
      distance = 12
    } = options;

    const promises = Array.from(elements).map((element, index) => {
      return slideFadeEnter(element, {
        duration,
        easing,
        distance,
        delay: index * stagger
      });
    });

    return Promise.all(promises);
  }

  function feedbackPulse(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) return Promise.resolve();

    const {
      duration = 150,
      scale = 1.02
    } = options;

    return new Promise(resolve => {
      const keyframes = [
        { transform: 'scale(1)' },
        { transform: `scale(${scale})` },
        { transform: 'scale(1)' }
      ];
      const timing = {
        duration,
        easing: ANIMATION_CONFIG.easing,
        fill: 'forwards'
      };
      element.animate(keyframes, timing).onfinish = () => resolve();
    });
  }

  function iconPop(element, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.opacity = '1';
      element.style.transform = 'scale(1)';
      return Promise.resolve();
    }

    const {
      duration = 200,
      easing = ANIMATION_CONFIG.easingBounce
    } = options;

    return new Promise(resolve => {
      const keyframes = [
        { opacity: 0, transform: 'scale(0)' },
        { opacity: 1, transform: 'scale(1.2)', offset: 0.5 },
        { opacity: 1, transform: 'scale(1)' }
      ];
      const timing = {
        duration,
        easing,
        fill: 'forwards'
      };
      element.animate(keyframes, timing).onfinish = () => resolve();
    });
  }

  function animateOnVisible(element, callback, options = {}) {
    if (!element) return;
    if (!isAnimationEnabled()) {
      callback(element);
      return;
    }

    const {
      threshold = 0.1,
      rootMargin = '50px'
    } = options;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
  }

  function animateAllOnVisible(elements, callback, options = {}) {
    if (!elements || elements.length === 0) return;
    Array.from(elements).forEach(element => {
      animateOnVisible(element, callback, options);
    });
  }

  function typingShimmer(element) {
    if (!element) return null;
    if (!isAnimationEnabled()) return null;

    const keyframes = [
      { opacity: 0.4 },
      { opacity: 1 },
      { opacity: 0.4 }
    ];
    const timing = {
      duration: 1400,
      easing: 'ease-in-out',
      iterations: Infinity
    };
    return element.animate(keyframes, timing);
  }

  function heightTransition(element, targetHeight, options = {}) {
    if (!element) return Promise.resolve();
    if (!isAnimationEnabled()) {
      element.style.height = `${targetHeight}px`;
      return Promise.resolve();
    }

    const {
      duration = ANIMATION_CONFIG.duration.medium,
      easing = ANIMATION_CONFIG.easing
    } = options;

    return new Promise(resolve => {
      element.style.transition = `height ${duration}ms ${easing}`;
      element.style.height = `${targetHeight}px`;
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  }

  function applyEnter(element, options = {}) {
    return slideFadeEnter(element, options);
  }

  function applyExit(element, options = {}) {
    return slideFadeExit(element, options);
  }

  // Export Animations
  window.KnodeAnimations = {
    slideFadeEnter,
    slideFadeExit,
    scaleFadeEnter,
    scaleFadeExit,
    staggerReveal,
    feedbackPulse,
    iconPop,
    typingShimmer,
    heightTransition,
    animateOnVisible,
    animateAllOnVisible,
    applyEnter,
    applyExit,
    config: ANIMATION_CONFIG,
    isEnabled: isAnimationEnabled
  };

  window.applyEnter = applyEnter;
  window.applyExit = applyExit;

  // ==================== CHAT SHELL MODULE ====================

  class ChatShell {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        title: options.title || 'Chat',
        statusText: options.statusText || 'Online',
        showStatus: options.showStatus !== false,
        autoScroll: options.autoScroll !== false,
        enableAnimations: window.ENABLE_CHAT_SHELL !== false,
        ...options
      };

      this.messages = [];
      this.typingAnimation = null;
      this.shell = null;
      this.contentArea = null;
      this.init();
    }

    init() {
      if (!this.container) {
        console.error('ChatShell: Container element not found');
        return;
      }
      this.render();
      this.setupEventListeners();
    }

    render() {
      const shellHTML = `
        <div class="kn-chat-shell">
          <div class="kn-chat-shell__titlebar">
            <div class="kn-chat-shell__title">
              <span>${this.escapeHtml(this.options.title)}</span>
            </div>
            ${this.options.showStatus ? `
              <div class="kn-chat-shell__status">
                <div class="kn-chat-shell__status-icon" aria-hidden="true"></div>
                <span class="kn-chat-shell__status-text">${this.escapeHtml(this.options.statusText)}</span>
              </div>
            ` : ''}
          </div>
          <div class="kn-chat-shell__content" role="log" aria-live="polite" aria-label="Chat messages"></div>
          <div class="kn-chat-shell__input-area"></div>
        </div>
      `;

      this.container.innerHTML = shellHTML;
      this.shell = this.container.querySelector('.kn-chat-shell');
      this.contentArea = this.shell.querySelector('.kn-chat-shell__content');
      this.inputArea = this.shell.querySelector('.kn-chat-shell__input-area');
    }

    addMessage(content, sender = 'bot', options = {}) {
      return new Promise((resolve) => {
        const { delay = 0, animate = this.options.enableAnimations } = options;
        setTimeout(() => {
          const messageEl = this.createMessageElement(content, sender);
          this.contentArea.appendChild(messageEl);
          this.messages.push({ content, sender, element: messageEl });
          if (animate && window.KnodeAnimations) {
            window.KnodeAnimations.slideFadeEnter(messageEl, { duration: 180 });
          }
          if (this.options.autoScroll) {
            this.scrollToBottom();
          }
          resolve(messageEl);
        }, delay);
      });
    }

    createMessageElement(content, sender) {
      const messageEl = document.createElement('div');
      messageEl.className = `kn-msg kn-msg--${sender}`;
      messageEl.setAttribute('role', 'article');

      const avatar = document.createElement('div');
      avatar.className = `kn-chat-avatar kn-chat-avatar--${sender}`;
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = sender === 'user' ? 'U' : 'B';

      const bubble = document.createElement('div');
      bubble.className = `kn-chat-bubble kn-chat-bubble--${sender}`;
      bubble.textContent = content;

      messageEl.appendChild(avatar);
      messageEl.appendChild(bubble);
      return messageEl;
    }

    showTypingIndicator(options = {}) {
      return new Promise((resolve) => {
        const { delay = 0, duration = 1500 } = options;
        setTimeout(() => {
          this.removeTypingIndicator();
          const typingEl = document.createElement('div');
          typingEl.className = 'kn-msg kn-msg--typing';
          typingEl.setAttribute('aria-label', 'Bot is typing');
          typingEl.innerHTML = `
            <div class="kn-chat-avatar kn-chat-avatar--bot" aria-hidden="true">B</div>
            <div class="kn-typing-indicator">
              <div class="kn-typing-dot"></div>
              <div class="kn-typing-dot"></div>
              <div class="kn-typing-dot"></div>
            </div>
          `;
          this.contentArea.appendChild(typingEl);
          if (this.options.enableAnimations && window.KnodeAnimations) {
            window.KnodeAnimations.slideFadeEnter(typingEl, { duration: 150 });
          }
          if (this.options.autoScroll) {
            this.scrollToBottom();
          }
          if (duration > 0) {
            setTimeout(() => {
              this.removeTypingIndicator();
              resolve();
            }, duration);
          } else {
            resolve();
          }
        }, delay);
      });
    }

    removeTypingIndicator() {
      const typingEl = this.contentArea.querySelector('.kn-msg--typing');
      if (typingEl) {
        if (this.options.enableAnimations && window.KnodeAnimations) {
          window.KnodeAnimations.slideFadeExit(typingEl, { duration: 120 }).then(() => {
            typingEl.remove();
          });
        } else {
          typingEl.remove();
        }
      }
    }

    async addSequentialMessages(messages) {
      for (const msg of messages) {
        const { content, sender = 'bot', delay = 1000, typingDelay = 1500 } = msg;
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (sender === 'bot' && typingDelay > 0) {
          await this.showTypingIndicator({ duration: typingDelay });
        }
        await this.addMessage(content, sender);
      }
    }

    setInputArea(content) {
      if (typeof content === 'string') {
        this.inputArea.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.inputArea.innerHTML = '';
        this.inputArea.appendChild(content);
      }
    }

    addOptions(options) {
      const optionsHTML = `
        <div class="kn-chat-options">
          ${options.map(opt => `
            <button class="kn-mcq-option kn-chat-option" data-id="${opt.id}" type="button">
              ${this.escapeHtml(opt.label)}
            </button>
          `).join('')}
        </div>
      `;
      this.inputArea.innerHTML = optionsHTML;
      const optionButtons = this.inputArea.querySelectorAll('.kn-chat-option');
      if (this.options.enableAnimations && window.KnodeAnimations) {
        window.KnodeAnimations.staggerReveal(optionButtons, { stagger: 60 });
      }
      optionButtons.forEach((btn, index) => {
        const option = options[index];
        if (option.callback) {
          btn.addEventListener('click', () => {
            option.callback(option.id, btn);
            optionButtons.forEach(b => b.disabled = true);
          });
        }
      });
    }

    scrollToBottom(smooth = true) {
      if (!this.contentArea) return;
      requestAnimationFrame(() => {
        this.contentArea.scrollTo({
          top: this.contentArea.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      });
    }

    clearMessages() {
      if (this.contentArea) {
        this.contentArea.innerHTML = '';
      }
      this.messages = [];
    }

    setupEventListeners() {
      if (this.options.autoScroll && this.contentArea) {
        const observer = new MutationObserver(() => {
          this.scrollToBottom();
        });
        observer.observe(this.contentArea, {
          childList: true,
          subtree: true
        });
        this.mutationObserver = observer;
      }
    }

    destroy() {
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
      }
      if (this.typingAnimation) {
        this.typingAnimation.cancel();
      }
      if (this.shell) {
        this.shell.remove();
      }
      this.messages = [];
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    setTitle(title) {
      const titleEl = this.shell.querySelector('.kn-chat-shell__title span');
      if (titleEl) {
        titleEl.textContent = title;
      }
      this.options.title = title;
    }

    setStatus(statusText, online = true) {
      const statusTextEl = this.shell.querySelector('.kn-chat-shell__status-text');
      const statusIconEl = this.shell.querySelector('.kn-chat-shell__status-icon');
      if (statusTextEl) {
        statusTextEl.textContent = statusText;
      }
      if (statusIconEl) {
        statusIconEl.style.background = online ? '#4ade80' : '#9ca3af';
      }
      this.options.statusText = statusText;
    }
     setVisible(visible) {
      if (!this.shell) return;
      
      if (visible) {
        // Restore chat shell
        this.shell.classList.remove('kn-chat-shell--hidden');
        this.shell.setAttribute('aria-hidden', 'false');
        
        // Restore scroll position if saved
        if (this._savedScrollPosition !== undefined && this.contentArea) {
          this.contentArea.scrollTop = this._savedScrollPosition;
        }
        
        // Restore focus if saved
        if (this._savedFocus && this._savedFocus.focus) {
          requestAnimationFrame(() => {
            this._savedFocus.focus();
          });
        }
      } else {
        // Save current scroll position
        if (this.contentArea) {
          this._savedScrollPosition = this.contentArea.scrollTop;
        }
        
        // Save current focus
        this._savedFocus = document.activeElement;
        
        // Hide chat shell
        this.shell.classList.add('kn-chat-shell--hidden');
        this.shell.setAttribute('aria-hidden', 'true');
      }
    }
  }

  function createChatShell(container, options = {}) {
    const element = typeof container === 'string' 
      ? document.querySelector(container)
      : container;
    if (!element) {
      console.error('ChatShell: Container not found', container);
      return null;
    }
    return new ChatShell(element, options);
  }

  window.ChatShell = ChatShell;
  window.createChatShell = createChatShell;

  // ==================== TYPEWRITER MODULE ====================

  class ExplainerTypewriter {
    constructor(target, options = {}) {
      this.target = typeof target === 'string' ? document.querySelector(target) : target;
      if (!this.target) {
        console.error('ExplainerTypewriter: Target element not found');
        return;
      }

      this.options = {
        speed: options.speed || 50,
        pauseOnPunctuation: options.pauseOnPunctuation !== false,
        punctuationPause: options.punctuationPause || 200,
        cursor: options.cursor !== false,
        cursorChar: options.cursorChar || '|',
        cursorClass: options.cursorClass || 'kn-typewriter-cursor',
        reserveLayout: options.reserveLayout !== false,
        minHeight: options.minHeight || 240,
        onComplete: options.onComplete || null,
        onCharacter: options.onCharacter || null,
        ...options
      };

      this.isTyping = false;
      this.isPaused = false;
      this.isStopped = false;
      this.currentText = '';
      this.currentIndex = 0;
      this.timeoutId = null;
      this.cursorElement = null;
      this.originalMinHeight = null;
      this.init();
    }

    init() {
      if (this.options.reserveLayout) {
        this.reserveLayout();
      }
      if (this.options.cursor) {
        this.createCursor();
      }
      this.target.classList.add('kn-typewriter-area');
    }

    reserveLayout() {
      this.originalMinHeight = this.target.style.minHeight;
      this.target.style.minHeight = `${this.options.minHeight}px`;
    }

    restoreLayout() {
      if (this.originalMinHeight !== null) {
        this.target.style.minHeight = this.originalMinHeight;
      }
    }

    measureContent(text) {
      const tempEl = document.createElement('div');
      tempEl.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${this.target.offsetWidth}px;
        font-family: ${window.getComputedStyle(this.target).fontFamily};
        font-size: ${window.getComputedStyle(this.target).fontSize};
        line-height: ${window.getComputedStyle(this.target).lineHeight};
        padding: ${window.getComputedStyle(this.target).padding};
      `;
      tempEl.textContent = text;
      document.body.appendChild(tempEl);
      const height = tempEl.offsetHeight;
      document.body.removeChild(tempEl);
      return height;
    }

    createCursor() {
      this.cursorElement = document.createElement('span');
      this.cursorElement.className = this.options.cursorClass;
      this.cursorElement.textContent = this.options.cursorChar;
      this.cursorElement.setAttribute('aria-hidden', 'true');
    }

    showCursor() {
      if (this.cursorElement && !this.cursorElement.parentNode) {
        this.target.appendChild(this.cursorElement);
      }
    }

    hideCursor() {
      if (this.cursorElement && this.cursorElement.parentNode) {
        this.cursorElement.remove();
      }
    }

    write(text, options = {}) {
      return new Promise((resolve, reject) => {
        if (!text) {
          resolve();
          return;
        }
        const writeOptions = { ...this.options, ...options };
        if (writeOptions.reserveLayout) {
          const requiredHeight = this.measureContent(text);
          if (requiredHeight > this.options.minHeight) {
            this.target.style.minHeight = `${requiredHeight + 20}px`;
          }
        }
        this.currentText = text;
        this.currentIndex = 0;
        this.isStopped = false;
        this.isPaused = false;
        this.isTyping = true;
        this.target.innerHTML = '';
        this.showCursor();
        this.typeNextCharacter(writeOptions, resolve, reject);
      });
    }

    typeNextCharacter(options, resolve, reject) {
      if (this.isStopped) {
        this.cleanup();
        reject(new Error('Typewriter stopped'));
        return;
      }
      if (this.isPaused) {
        this.timeoutId = setTimeout(() => {
          this.typeNextCharacter(options, resolve, reject);
        }, 100);
        return;
      }
      if (this.currentIndex >= this.currentText.length) {
        this.complete();
        resolve();
        return;
      }
      const char = this.currentText[this.currentIndex];
      this.hideCursor();
      const textNode = document.createTextNode(char);
      this.target.appendChild(textNode);
      this.showCursor();
      if (options.onCharacter) {
        options.onCharacter(char, this.currentIndex, this.currentText);
      }
      this.currentIndex++;
      let delay = options.speed;
      if (options.pauseOnPunctuation) {
        if (['.', '!', '?', ':', ';'].includes(char)) {
          delay = options.punctuationPause;
        } else if (char === ',') {
          delay = options.punctuationPause / 2;
        }
      }
      this.timeoutId = setTimeout(() => {
        this.typeNextCharacter(options, resolve, reject);
      }, delay);
    }

    complete() {
      return new Promise((resolve) => {
        if (!this.isTyping) {
          resolve();
          return;
        }
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        this.hideCursor();
        if (this.currentIndex < this.currentText.length) {
          const remainingText = this.currentText.slice(this.currentIndex);
          const textNode = document.createTextNode(remainingText);
          this.target.appendChild(textNode);
          this.currentIndex = this.currentText.length;
        }
        this.isTyping = false;
        if (this.options.onComplete) {
          this.options.onComplete();
        }
        resolve();
      });
    }

    pause() {
      if (this.isTyping && !this.isPaused) {
        this.isPaused = true;
      }
    }

    resume() {
      if (this.isTyping && this.isPaused) {
        this.isPaused = false;
      }
    }

    stop() {
      this.isStopped = true;
      this.isTyping = false;
      this.isPaused = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.hideCursor();
    }

    setSpeed(speed) {
      this.options.speed = speed;
    }

    clear() {
      this.target.innerHTML = '';
      this.currentText = '';
      this.currentIndex = 0;
      this.isTyping = false;
    }

    cleanup() {
      this.hideCursor();
      this.isTyping = false;
      this.isPaused = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }

    destroy() {
      this.stop();
      this.clear();
      this.restoreLayout();
      this.target.classList.remove('kn-typewriter-area');
      if (this.cursorElement) {
        this.cursorElement = null;
      }
    }
  }

  class EnhancedTypewriterManager {
    constructor(target, delay = 50) {
      this.target = target;
      this.delay = delay;
      this.currentTypewriter = null;
      this.isStopped = false;
      this.isComplete = false;
    }

    async typeContent(content, options = {}) {
      if (!content || !this.target) {
        return Promise.resolve();
      }
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      if (this.currentTypewriter) {
        this.currentTypewriter.stop();
      }
      this.isStopped = false;
      this.isComplete = false;
      this.currentTypewriter = new ExplainerTypewriter(this.target, {
        speed: this.delay,
        reserveLayout: true,
        minHeight: 240,
        pauseOnPunctuation: true,
        cursor: true,
        onComplete: () => {
          this.isComplete = true;
        }
      });
      try {
        await this.currentTypewriter.write(textContent);
      } catch (error) {
        if (error.message !== 'Typewriter stopped') {
          console.error('Typewriter error:', error);
        }
      }
    }

    complete() {
      if (this.currentTypewriter) {
        return this.currentTypewriter.complete();
      }
      return Promise.resolve();
    }

    stop() {
      this.isStopped = true;
      if (this.currentTypewriter) {
        this.currentTypewriter.stop();
      }
    }

    setSpeed(speed) {
      this.delay = speed;
      if (this.currentTypewriter) {
        this.currentTypewriter.setSpeed(speed);
      }
    }

    destroy() {
      this.stop();
      if (this.currentTypewriter) {
        this.currentTypewriter.destroy();
        this.currentTypewriter = null;
      }
    }
  }

  window.ExplainerTypewriter = ExplainerTypewriter;
  window.EnhancedTypewriterManager = EnhancedTypewriterManager;

  // ==================== INITIALIZATION ====================
  console.log('✨ Knode Learning Flow initialized (embeddable)', {
    animations: isAnimationEnabled(),
    chatShell: true,
    typewriter: true
  });

})(window);
</script>

<script>
function renderTextQuizTile(tile) {
  const container = document.getElementById("knodeTileContainer");
  container.innerHTML = `
    <div class="knode-tile full-screen-tile" id="textQuizTile">
      <div class="quiz-whiteboard">

        <div class="knode-pills overlay-pills">
          <span class="pill">${tile.topic || ""}</span>
          <span class="pill">${tile.title || "Written Task"}</span>
          <span class="pill duration">⏱ ${tile.duration || "~5 min"}</span>
        </div>

        <div class="mock-mail">${tile.promptHtml || ""}</div>

        <form id="text-quiz-form" class="text-quiz-form" novalidate>
          ${ (tile.answerFields || []).map(f => `
            <label for="${f.id}" class="tq-label">${f.label}</label>
            <textarea id="${f.id}" name="${f.id}" class="tq-input" rows="6"
              minlength="${f.min || 0}" maxlength="${f.max || 2000}" required></textarea>
          `).join('')}
          <div class="tq-actions">
            <button id="tq-submit" class="knode-btn" type="submit">Send Reply →</button>
          </div>
        </form>

        <!-- Same overlay you already use -->
        <div id="results-view" class="explainer-container" style="display:none;">
          <div class="float-icon" id="floatIcon">✔</div>
          <div class="float-xp" id="floatXP">+10XP</div>
          <div id="answer-status" class="answer-status"></div>
          <div id="typewriter"></div>

          <div class="next-controls">
            <button id="next-btn" class="knode-btn" style="display:none;">Next</button>
            <button id="skipbtn" class="knode-btn">Skip Explainer →</button>
            <button id="speed-toggle" class="speed-toggle">Speed: 1x</button>
          </div>

          <div class="cta">
            <button id="replay-cta-btn" class="knode-btn">Replay</button>
            <button id="nextBtn" class="overlay-next-btn" type="button">Let’s move on →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Submit handler
  const form = document.getElementById('text-quiz-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect answers
    const answers = {};
    (tile.answerFields || []).forEach(f => {
      answers[f.id] = (document.getElementById(f.id)?.value || "").trim();
    });

    // Simple validation
    const invalid = (tile.answerFields || []).find(f => {
      const len = (answers[f.id] || "").length;
      return len < (f.min || 0);
    });
    if (invalid) {
      // tiny UX nudge
      document.getElementById(invalid.id).focus();
      document.getElementById(invalid.id).classList.add('tq-error');
      setTimeout(() => document.getElementById(invalid.id).classList.remove('tq-error'), 800);
      return;
    }

    // For MVP: use the pre-canned evaluation already shaped for SequencePlayer
    const rendered = tile.evaluation || [];
    window.cachedResults = rendered;

    // Swap views (same as MCQ flow)
  const resultsView = document.getElementById("results-view");
  const speedBtn = document.getElementById("speed-toggle");

    applyExit(form);
    resultsView.style.display = 'block';
    applyEnter(resultsView);

    // Ensure anchors then play
    setTimeout(() => {
      window.typewriterTarget = document.getElementById("typewriter");
      window.floatIcon = document.getElementById("floatIcon");
      window.floatXP = document.getElementById("floatXP");

      // (re)bind speed toggle to this player
      const player = ensurePlayer();
      if (speedBtn && player) {
        speedBtn.onclick = () => {
          player.playbackSpeed = player.playbackSpeed === 1.0 ? 1.5 : 1.0;
          speedBtn.textContent = `Speed: ${player.playbackSpeed}x`;
        };
      }

      player.stop();
      player.playSequence(rendered, 0);
    }, 0);
  });
}
</script>

<script>
function renderScenarioTile(data) {
  const container = document.getElementById("knodeTileContainer");
  container.innerHTML = `
    <div class="knode-tile full-screen-tile" id="scenarioTile">
      <div class="quiz-whiteboard">
        <div class="knode-pills overlay-pills">
          <span class="pill">${data.topic || ""}</span>
          <span class="pill">${data.title || "Scenario"}</span>
          <span class="pill duration">${data.duration || ""}</span>
        </div>

        <div class="scenario-wrapper">
          ${data.scenarioHtml || ""}
          <div class="scenario-options">
            ${data.options.map(o => `<button class="knode-btn scenario-opt" data-id="${o.id}">${o.label}</button>`).join("")}
          </div>
        </div>

        <!-- Reuse same results/CTA area so V1 player works unchanged -->
        <div id="results-view" class="explainer-container" style="display:none;">
          <div class="float-icon" id="floatIcon">✔</div>
          <div class="float-xp" id="floatXP">+10XP</div>
          <div id="answer-status" class="answer-status"></div>
          <div id="typewriter"></div>

          <div class="next-controls">
            <button id="next-btn" class="knode-btn" style="display:none;">Next</button>
            <button id="skipbtn" class="knode-btn">Skip Explainer →</button>
            <button id="speed-toggle" class="speed-toggle">Speed: 1x</button>
          </div>

          <div class="cta">
            <button id="replay-cta-btn" class="knode-btn">Replay</button>
            <button id="nextBtn" class="overlay-next-btn">Let’s move on →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire options
  document.querySelectorAll(".scenario-opt").forEach(btn => {
    btn.onclick = () => {
      const choice = btn.getAttribute("data-id");
      const evaluation = (data.branches && data.branches[choice]) || [];
      if (!evaluation.length) return;

      // swap to results-view (same anchors you already use)
      const resultsView = document.getElementById("results-view");
      resultsView.style.display = 'block';
      applyEnter(resultsView);

      // refresh globals for V1 player
      window.typewriterTarget = document.getElementById("typewriter");
      window.cta        = document.querySelector('#results-view .cta');
      window.floatIcon  = document.getElementById("floatIcon");
      window.floatXP    = document.getElementById("floatXP");

      // cache for replay
      window.cachedResults = evaluation;

      const player = ensurePlayer(); // your singleton from earlier
      if (!player) return;
      player.stop();
      player.playSequence(evaluation, 0);

      // wire “Let’s move on” (same pattern you’re using)
      const nxtButton = document.getElementById("nextBtn");
      if (nxtButton) {
        nxtButton.onclick = () => navigateToTile(tileIndex + 1);
      }
      // wire replay
      const replayButton = document.getElementById("replay-cta-btn");
      if (replayButton) {
        replayButton.onclick = () => {
          const p = ensurePlayer(); if (!p) return;
          p.stop();
          p.playSequence(window.cachedResults || [], 0);
        };
      }
    };
  });
}

function renderChatQuizTile(data) {
  const container = document.getElementById("knodeTileContainer");
  
  // Use polished ChatShell if enabled
  const usePolishedShell = window.ENABLE_CHAT_SHELL !== false;
  
  container.innerHTML = `
    <div class="knode-tile full-screen-tile" id="chatQuizTile">
      <div class="quiz-whiteboard">
        <div class="knode-pills overlay-pills">
          <span class="pill">${data.topic || ""}</span>
          <span class="pill">${data.title || "Chat Quiz"}</span>
          <span class="pill duration">${data.duration || "~3 min"}</span>
        </div>

        ${usePolishedShell ? `
          <div class="kn-frame kn-frame--chat" style="margin: 2rem auto;">
            <div id="polishedChatShell"></div>
          </div>
        ` : `
          <div class="chat-quiz-container">
            <div class="chat-thread" id="chatThread"></div>
            <div class="chat-input-area" id="chatInputArea">
              <div class="scenario-options">
                ${data.options.map(o => `<button class="knode-btn chat-option" data-id="${o.id}">${o.label}</button>`).join("")}
              </div>
            </div>
          </div>
        `}

        <!-- Reuse same results/CTA area -->
        <div id="results-view" class="explainer-container" style="display:none;">
          <div class="float-icon" id="floatIcon">✔</div>
          <div class="float-xp" id="floatXP">+10XP</div>
          <div id="answer-status" class="answer-status"></div>
          <div id="typewriter"></div>

          <div class="next-controls">
            <button id="next-btn" class="knode-btn" style="display:none;">Next</button>
            <button id="skipbtn" class="knode-btn">Skip Explainer →</button>
            <button id="speed-toggle" class="speed-toggle">Speed: 1x</button>
          </div>

          <div class="cta">
            <button id="replay-cta-btn" class="knode-btn">Replay</button>
            <button id="nextBtn" class="overlay-next-btn">Let's move on →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize chat with messages

 if (usePolishedShell && window.ChatShell) {
    // Use polished ChatShell component
    const chatShell = new ChatShell(document.getElementById('polishedChatShell'), {
      title: data.title || 'Chat Quiz',
      statusText: 'Online',
      showStatus: true
    });
    
      // Store reference for cleanup and later use
    window._chatShellInstance = chatShell;
    
    // Check for new quiz modes
    const quizMode = data.mode || 'legacy';
    
    if (quizMode === 'chatmcq' && data.graph && data.startId) {
      // New MCQ branching mode
      runMCQ({ 
        graph: data.graph, 
        startId: data.startId, 
        chatShell: chatShell 
      }).then(transcript => {
        // After all questions answered, show explainer
        const evaluation = data.explainer || [];
        showExplainerWithTransition(chatShell, evaluation, transcript);
      });
      
    } else if (quizMode === 'chatfreetext' && data.graph && data.startId) {
      // New free-text mode
      runFreeText({ 
        graph: data.graph, 
        startId: data.startId, 
        chatShell: chatShell,
        maxQuestions: data.maxQuestions || 2,
        minHintChars: data.minHintChars || 40
      }).then(result => {
        // After max questions, show explainer with analysis
        const evaluation = data.explainer || [];
        
        // Enhance explainer with user response analysis
        if (data.analyzeResponses && result.userResponses) {
          // Add analysis to explainer based on user responses
          const analysis = data.analyzeResponses(result.userResponses);
          evaluation.unshift({
            type: 'text',
            content: analysis
          });
        }
        
        showExplainerWithTransition(chatShell, evaluation, result.transcript);
      });
      
    } else {
      // Legacy mode - original chat quiz flow
      // Add sequential messages
      const messages = (data.messages || []).map((msg, idx) => ({
        content: msg.content,
        sender: msg.type === 'user' ? 'user' : 'bot',
        delay: idx * 1000,
        typingDelay: msg.type === 'bot' ? 1200 : 0
      }));
      
      chatShell.addSequentialMessages(messages).then(() => {
        // Add options
        chatShell.addOptions(data.options.map(o => ({
          id: o.id,
          label: o.label,
          callback: (choiceId, btn) => {
            const evaluation = (data.branches && data.branches[choiceId]) || [];
            if (!evaluation.length) return;
            
            // Add user message
            chatShell.addMessage(o.label, 'user');
            
            // Show typing indicator
            chatShell.showTypingIndicator({ delay: 500, duration: 1500 }).then(() => {
              // Swap to results view
              proceedToResults(evaluation);
            });
          }
        })));
      });
    }
    
  } else {
    // Use legacy chat implementation
    const chatThread = document.getElementById("chatThread");
    const messages = data.messages || [];

    function addMessage(content, sender = 'bot', delay = 0) {
      setTimeout(() => {
        const messageEl = document.createElement('div');
        messageEl.className = 'msg kn-msg kn-msg--' + sender;
        
        const avatar = document.createElement('div');
        avatar.className = `chat-avatar kn-chat-avatar kn-chat-avatar--${sender}`;
        avatar.textContent = sender === 'user' ? 'U' : 'B';
        
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble kn-chat-bubble kn-chat-bubble--${sender}`;
        bubble.textContent = content;
        
        messageEl.appendChild(avatar);
        messageEl.appendChild(bubble);
        chatThread.appendChild(messageEl);
        
        // Animate if enabled
        if (window.KnodeAnimations && window.ENABLE_POLISH_ANIMATIONS) {
          window.KnodeAnimations.slideFadeEnter(messageEl, { duration: 180 });
        }
        
        // Auto-scroll to bottom
        chatThread.scrollTop = chatThread.scrollHeight;
      }, delay);
    }

    function showTypingIndicator(delay = 0) {
      setTimeout(() => {
        const typingEl = document.createElement('div');
        typingEl.className = 'msg kn-msg';
        typingEl.innerHTML = `
          <div class="chat-avatar kn-chat-avatar kn-chat-avatar--bot">B</div>
          <div class="typing-indicator kn-typing-indicator">
            <div class="typing-dot kn-typing-dot"></div>
            <div class="typing-dot kn-typing-dot"></div>
            <div class="typing-dot kn-typing-dot"></div>
          </div>
        `;
        chatThread.appendChild(typingEl);
        chatThread.scrollTop = chatThread.scrollHeight;
      }, delay);
    }

    function removeTypingIndicator() {
      const typingEl = chatThread.querySelector('.typing-indicator');
      if (typingEl) {
        typingEl.closest('.msg').remove();
      }
    }

    // Start the conversation (legacy mode)
    function startConversation() {
      messages.forEach((msg, index) => {
        if (msg.type === 'bot') {
          showTypingIndicator(index * 1000);
          setTimeout(() => {
            removeTypingIndicator();
            addMessage(msg.content, 'bot');
          }, index * 1000 + 1500);
        } else if (msg.type === 'user') {
          addMessage(msg.content, 'user', index * 1000 + 2000);
        }
      });
    }

    // Wire up chat options (legacy mode)
    document.querySelectorAll(".chat-option").forEach(btn => {
      btn.onclick = () => {
        const choice = btn.getAttribute("data-id");
        const choiceText = btn.textContent;
        
        // Add user message
        addMessage(choiceText, 'user');
        
        // Disable all options
        document.querySelectorAll(".chat-option").forEach(opt => opt.disabled = true);
        
        // Show typing indicator
        showTypingIndicator(500);
        
        // Get evaluation and proceed
        const evaluation = (data.branches && data.branches[choice]) || [];
        if (!evaluation.length) return;

        setTimeout(() => {
          removeTypingIndicator();
          proceedToResults(evaluation);
        }, 2000);
      };
    });

    // Start the conversation
    startConversation();
  }
  
  // Common function to proceed to results
  function proceedToResults(evaluation) {
    const resultsView = document.getElementById("results-view");
     const observer = new MutationObserver(() => {
  const frame = document.querySelector('.kn-frame.kn-frame--chat');
  if (frame) {
    frame.style.display = 'none';
    observer.disconnect(); // stop watching once found
  }
});

observer.observe(document.body, { childList: true, subtree: true });
 
  
    resultsView.style.display = 'block';
    
    
    if (window.KnodeAnimations && window.ENABLE_POLISH_ANIMATIONS) {
      window.KnodeAnimations.slideFadeEnter(resultsView);
    } else {
      applyEnter(resultsView);
    }

    // Refresh globals for player
    window.typewriterTarget = document.getElementById("typewriter");
    window.cta = document.querySelector('#results-view .cta');
    window.floatIcon = document.getElementById("floatIcon");
    window.floatXP = document.getElementById("floatXP");

    // Cache for replay
    window.cachedResults = evaluation;

    const player = ensurePlayer();
    if (!player) return;
    player.stop();
    player.playSequence(evaluation, 0);

    // Wire up navigation
    const nxtButton = document.getElementById("nextBtn");
    if (nxtButton) {
       nxtButton.onclick = () => {
        // Restore chat container before navigating
        if (chatContainer) {
          chatContainer.style.display = 'block';
        }
        resultsView.style.display = 'none';
        navigateToTile(tileIndex + 1);
      };
    }
    
    const replayButton = document.getElementById("replay-cta-btn");
    if (replayButton) {
      replayButton.onclick = () => {
        const p = ensurePlayer();
        if (!p) return;
        p.stop();
        p.playSequence(window.cachedResults || [], 0);
      };
    }
  }
}
</script>