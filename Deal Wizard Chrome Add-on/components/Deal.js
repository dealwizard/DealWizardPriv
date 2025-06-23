import LoggerFactory from '../tools/logger.js';
import Toast from './Toast.js';
import { DEAL_WIZARD_BASE_URL, LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/DEAL', LOG_LEVEL);
logger.info('Deal.js loaded');

class Deal {
  constructor(icon, response) {
    this.icon = icon;
    this.response = response;
    // Use the complete uniqueId for the URL
    this.destinationUrl = response?.uniqueId ? 
      `${DEAL_WIZARD_BASE_URL}/${response.uniqueId}` : 
      null;
    this.createdTabId = null; // Store the created tab ID
    
    logger.debug('Deal constructed with URL:', this.destinationUrl);

    // Immediately open the tab if URL is available
    if (this.destinationUrl) {
      chrome.runtime.sendMessage({ 
        type: "analyze", 
        destinationUrl: this.destinationUrl
      }, (response) => {
        if (response && response.tabId) {
          this.setCreatedTabId(response.tabId);
          logger.info('[DEAL-WIZARD][NAVIGATION] Background tab opened immediately:', { 
            destinationUrl: this.destinationUrl,
            tabId: response.tabId 
          });
        }
      });
    }
  }

  initialize() {
    try {
      this.icon.src = chrome.runtime.getURL("Assets/deal.png");
    } catch (err) {
      logger.info("Extension context invalidated. Aborting icon update.");
      return;
    }

    this.icon.title = this.destinationUrl ? "Click to view the deal" : "No deal found";
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
      if (this.createdTabId) {
        chrome.runtime.sendMessage({ type: "focusTab", tabId: this.createdTabId });
        logger.info('Focusing existing deal tab:', this.createdTabId);
      }
    });
  }

  setCreatedTabId(tabId) {
    this.createdTabId = tabId;
    logger.debug('Stored created tab ID:', tabId);
  }
}

export { Deal as default }; 