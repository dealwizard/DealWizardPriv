import LoggerFactory from '../utils/logger';
import Toast from './toast';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/DEAL');
logger.info('Deal module loaded');

interface DealResponse {
  destinationUrl?: string;
  tabId?: number;
  [key: string]: any;
}

class Deal {
  private icon: HTMLImageElement;
  private response: DealResponse | null;
  private destinationUrl: string | null;

  constructor(icon: HTMLImageElement, response: DealResponse | null) {
    this.icon = icon;
    this.response = response;
    this.destinationUrl = response?.destinationUrl || null;
  }

  initialize(): void {
    try {
      this.icon.src = chrome.runtime.getURL("assets/deal.png");
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

  private playSuccessSound(): void {
    const successSound = new Audio(chrome.runtime.getURL("assets/success.wav"));
    successSound.play().catch(err => logger.error("'Success' sound failed to play:", err));
  }

  private setupTransitionEffects(): void {
    this.icon.classList.remove("rm-transition-out");
    this.icon.classList.add("rm-transition-in");

    const newIcon = this.icon.cloneNode(true) as HTMLImageElement;
    this.icon.replaceWith(newIcon);
    this.icon = newIcon;
    this.icon.classList.add("deal-ready");

    this.icon.classList.add("bouncing");
    this.icon.addEventListener("animationend", () => {
      this.icon.classList.remove("bouncing");
    }, { once: true });
  }

  private setupHoverHandler(): void {
    const goalInput = document.querySelector('.goal-input-container');
    const goalIcon = document.querySelector('.goal-icon-container');
    
    if (goalInput && goalIcon) {
      this.icon.addEventListener("mouseenter", () => {
        goalInput.classList.add('expanded');
        goalIcon.classList.add('glowing');
      });

      this.icon.addEventListener("mouseleave", (event: MouseEvent) => {
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

  private setupClickHandler(): void {
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

export default Deal;