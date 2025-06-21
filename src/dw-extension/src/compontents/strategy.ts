import LoggerFactory from '../utils/logger';
import StrategyStorage from './strategyStorage';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/STRATEGY');
logger.info('Strategy module loaded');

const DEFAULT_STRATEGY = 'flip';

type StrategyType = 'flip' | 'btl' | 'hmo';
type StrategySelectCallback = (strategy: string | undefined) => void;

class Strategy {
  private wrapper: HTMLElement;
  private onStrategySelect: StrategySelectCallback;
  selectedStrategy: string | null;
  
  constructor(wrapper: HTMLElement, onStrategySelect: StrategySelectCallback) {
    logger.info('Initializing Strategy');
    this.wrapper = wrapper;
    this.onStrategySelect = onStrategySelect;
    this.selectedStrategy = null;
    
    this.initialize();
  }

  async initialize(): Promise<void> {
    logger.info('Loading saved strategy');
    // Load saved strategy or use default
    this.selectedStrategy = await StrategyStorage.getSelectedStrategy() || DEFAULT_STRATEGY;
    logger.info('Using strategy:', this.selectedStrategy);

    // If using default strategy, save it
    if (this.selectedStrategy === DEFAULT_STRATEGY && !(await StrategyStorage.getSelectedStrategy())) {
      await StrategyStorage.saveSelectedStrategy(DEFAULT_STRATEGY);
    }

    // Create UI
    this.createStrategyMenu();

    // Set up storage change listener
    this.setupStorageListener();

    // Select the strategy
    this.updateUI(this.selectedStrategy);
    if (this.onStrategySelect) {
      logger.info('Calling onStrategySelect with strategy:', this.selectedStrategy);
      this.onStrategySelect(this.selectedStrategy);
    }
  }

  createStrategyMenu(): void {
    logger.info('Creating strategy menu');
    const strategyMenu = document.createElement('div');
    strategyMenu.className = 'strategy-menu';

    const options = document.createElement('div');
    options.className = 'strategy-options';

    // Create strategy buttons - FLIP first
    const strategies: StrategyType[] = [DEFAULT_STRATEGY as StrategyType, 'btl', 'hmo'];
    strategies.forEach(strategy => {
      const button = this.createStrategyButton(strategy);
      options.appendChild(button);
    });

    strategyMenu.appendChild(options);
    this.wrapper.appendChild(strategyMenu);
  }

  createStrategyButton(strategy: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'strategy-option';
    button.textContent = strategy.toUpperCase();
    button.onclick = (e: MouseEvent): void => {
      e.stopPropagation();
      this.handleStrategySelect(strategy);
    };
    return button;
  }

  async handleStrategySelect(strategy: string): Promise<void> {
    logger.info('Strategy selected:', strategy);
    this.selectedStrategy = strategy;
    
    // Save to storage
    await StrategyStorage.saveSelectedStrategy(strategy);
    
    // Update UI
    this.updateUI(strategy);

    // Notify parent
    if (this.onStrategySelect) {
      logger.info('Calling onStrategySelect:', strategy);
      this.onStrategySelect(strategy);
    }
  }

  updateUI(strategy: string | null): void {
    if (!strategy) return;
    
    logger.info('Updating UI for strategy:', strategy);
    document.querySelectorAll('.strategy-option').forEach((btn: Element) => {
      btn.classList.remove('selected');
      if (btn.textContent?.toLowerCase() === strategy.toLowerCase()) {
        btn.classList.add('selected');
      }
    });
  }

  setupStorageListener(): void {
    logger.info('Setting up storage listener');
    StrategyStorage.onStrategyChange((newStrategy: string | undefined) => {
      logger.info('Strategy changed in storage:', newStrategy);
      this.selectedStrategy = newStrategy || null;
      if (newStrategy) {
        this.updateUI(newStrategy);
        if (this.onStrategySelect) {
          this.onStrategySelect(newStrategy);
        }
      }
    });
  }
}

export default Strategy;