import LoggerFactory from '../tools/logger.js';
import Toast from './Toast.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/DEAL');
logger.info('Deal.js loaded');

class Deal {
  constructor(icon, response) {
    this.icon = icon;
    this.response = response;
    this.destinationUrl = response?.destinationUrl || null;
  }

  initialize() {
    try {
      this.icon.src = chrome.runtime.getURL("Assets/deal.png");
    } catch (err) {
      logger.info("Extension context invalidated. Aborting icon update.");
      return;
    }

    this.icon.title = this.destinationUrl ? "Click to open deal" : "No deal found";
    this.icon.classList.add("deal-ready");

    this.playSuccessSound();
    new Toast("Deal ready!", 'success').show();

    this.setupTransitionEffects();
    this.setupClickHandler();
    this.setupHoverHandler();
  }

  playSuccessSound() {
    const successSound = new Audio(chrome.runtime.getURL("Assets/success.wav"));
    successSound.play().catch(err => logger.error("'Success' sound failed to play:", err));
  }

  setupTransitionEffects() {
    this.icon.classList.remove("rm-transition-out");
    this.icon.classList.add("rm-transition-in");

    const newIcon = this.icon.cloneNode(true);
    this.icon.replaceWith(newIcon);
    this.icon = newIcon;
    this.icon.classList.add("deal-ready");

    this.icon.classList.add("bouncing");
    this.icon.addEventListener("animationend", () => {
      this.icon.classList.remove("bouncing");
    }, { once: true });
  }

  setupHoverHandler() {
    const goalInput = document.querySelector('.goal-input-container');
    const goalIcon = document.querySelector('.goal-icon-container');
    
    if (goalInput && goalIcon) {
      this.icon.addEventListener("mouseenter", () => {
        goalInput.classList.add('expanded');
        goalIcon.classList.add('glowing');
      });

      this.icon.addEventListener("mouseleave", (event) => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        setTimeout(() => {
          const goalRect = goalInput.getBoundingClientRect();
          
          if (!(mouseX >= goalRect.left && mouseX <= goalRect.right && 
                mouseY >= goalRect.top && mouseY <= goalRect.bottom)) {
            goalInput.classList.remove('expanded');
            goalIcon.classList.remove('glowing');
          }
        }, 100);
      });
    }
  }

  setupClickHandler() {
    this.icon.addEventListener("click", () => {
      if (this.response?.tabId) {
        chrome.runtime.sendMessage({ type: "focusTab", tabId: this.response.tabId });
      } else if (this.destinationUrl) {
        window.open(this.destinationUrl, "_blank");
      } else {
        logger.warn("No deal URL to open.");
      }
    });
  }
}

export { Deal as default }; 