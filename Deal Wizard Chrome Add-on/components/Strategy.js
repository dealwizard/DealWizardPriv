import LoggerFactory from '../tools/logger.js';
import Toast from './Toast.js';
import StrategyStorage from './strategyStorage.js';
import { LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/STRATEGY', LOG_LEVEL);
logger.info('Strategy.js loaded');

const DEFAULT_STRATEGY = 'flip';

class Strategy {
  constructor(wrapper, onStrategySelect) {
    logger.info('Initializing Strategy');
    this.wrapper = wrapper;
    this.onStrategySelect = onStrategySelect;
    this.selectedStrategy = null;
    
    this.initialize();
  }

  async initialize() {
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

  createStrategyMenu() {
    logger.info('Creating strategy menu');
    const strategyMenu = document.createElement('div');
    strategyMenu.className = 'strategy-menu';

    const options = document.createElement('div');
    options.className = 'strategy-options';

    // Create strategy buttons - FLIP first
    const strategies = [DEFAULT_STRATEGY, 'btl', 'hmo'];
    strategies.forEach(strategy => {
      const button = this.createStrategyButton(strategy);
      options.appendChild(button);
    });

    strategyMenu.appendChild(options);
    this.wrapper.appendChild(strategyMenu);
  }

  createStrategyButton(strategy) {
    const button = document.createElement('button');
    button.className = 'strategy-option';
    button.textContent = strategy.toUpperCase();
    button.onclick = (e) => {
      e.stopPropagation();
      this.handleStrategySelect(strategy);
    };
    return button;
  }

  async handleStrategySelect(strategy) {
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

  updateUI(strategy) {
    logger.info('Updating UI for strategy:', strategy);
    document.querySelectorAll('.strategy-option').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.textContent.toLowerCase() === strategy) {
        btn.classList.add('selected');
      }
    });
  }

  setupStorageListener() {
    logger.info('Setting up storage listener');
    StrategyStorage.onStrategyChange((newStrategy) => {
      logger.info('Strategy changed in storage:', newStrategy);
      this.selectedStrategy = newStrategy;
      this.updateUI(newStrategy);
      if (this.onStrategySelect) {
        this.onStrategySelect(newStrategy);
      }
    });
  }
}

export { Strategy as default }; 