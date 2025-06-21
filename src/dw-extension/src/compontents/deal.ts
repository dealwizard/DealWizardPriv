import LoggerFactory, { Logger } from '../utils/logger';
import Toast from './toast';

const logger: Logger = LoggerFactory.getLogger('DEAL-WIZARD/DEAL');
logger.info('Deal.js loaded');

interface DealResponse {
  uniqueId?: string;
  [key: string]: any;
}

class Deal {
  private icon: HTMLImageElement;
  private response: DealResponse;
  public destinationUrl: string | null;
  private createdTabId: number | null;

  constructor(icon: HTMLImageElement, response: DealResponse) {
    this.icon = icon;
    this.response = response;
    // Use the complete uniqueId for the URL
    this.destinationUrl = response?.uniqueId
      ? `https://deal-wizard-home-61532.bubbleapps.io/new_product_page/${response.uniqueId}`
      : null;
    this.createdTabId = null; // Store the created tab ID

    logger.debug('Deal constructed with URL:', this.destinationUrl);
  }

  public initialize(): void {
    try {
      this.icon.src = chrome.runtime.getURL('assets/deal.png');
    } catch (err) {
      logger.info('Extension context invalidated. Aborting icon update.');
      return;
    }

    this.icon.title = this.destinationUrl ? 'Click to view the deal' : 'No deal found';
    this.icon.classList.add('deal-ready');

    this.playSuccessSound();
    new Toast('Deal ready!', 'success').show();

    this.setupTransitionEffects();
    this.setupClickHandler();
    this.setupHoverHandler();
  }

  private playSuccessSound(): void {
    const successSound = new Audio(chrome.runtime.getURL('assets/success.wav'));
    successSound.play().catch(err => logger.error("'Success' sound failed to play:", err));
  }

  private setupTransitionEffects(): void {
    this.icon.classList.remove('rm-transition-out');
    this.icon.classList.add('rm-transition-in');

    const newIcon = this.icon.cloneNode(true) as HTMLImageElement;
    this.icon.replaceWith(newIcon);
    this.icon = newIcon;
    this.icon.classList.add('deal-ready');

    this.icon.classList.add('bouncing');
    this.icon.addEventListener(
      'animationend',
      () => {
        this.icon.classList.remove('bouncing');
      },
      { once: true }
    );
  }

  private setupHoverHandler(): void {
    const goalInput = document.querySelector('.goal-input-container') as HTMLElement;
    const goalIcon = document.querySelector('.goal-icon-container') as HTMLElement;

    if (goalInput && goalIcon) {
      this.icon.addEventListener('mouseenter', () => {
        goalInput.classList.add('expanded');
        goalIcon.classList.add('glowing');
      });

      this.icon.addEventListener('mouseleave', (event: MouseEvent) => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        setTimeout(() => {
          const goalRect = goalInput.getBoundingClientRect();

          if (
            !(
              mouseX >= goalRect.left &&
              mouseX <= goalRect.right &&
              mouseY >= goalRect.top &&
              mouseY <= goalRect.bottom
            )
          ) {
            goalInput.classList.remove('expanded');
            goalIcon.classList.remove('glowing');
          }
        }, 100);
      });
    }
  }

  private setupClickHandler(): void {
    this.icon.addEventListener('click', () => {
      if (this.createdTabId) {
        chrome.runtime.sendMessage({ action: 'focusTab', tabId: this.createdTabId });
        logger.info('Focusing existing deal tab:', this.createdTabId);
      }
    });
  }

  public setCreatedTabId(tabId: number): void {
    this.createdTabId = tabId;
    logger.debug('Stored created tab ID:', tabId);
  }
}

export default Deal;
