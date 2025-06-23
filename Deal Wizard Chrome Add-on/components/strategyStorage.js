import LoggerFactory from '../tools/logger.js';
import { LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/STRATEGY/STORAGE', LOG_LEVEL);
logger.info('Loading storage module');

const SELECTED_STRATEGY_KEY = 'selectedStrategy';

class StrategyStorage {
    static async saveSelectedStrategy(strategyName) {
        logger.info('Attempting to save strategy:', strategyName);
        try {
            await chrome.storage.sync.set({ [SELECTED_STRATEGY_KEY]: strategyName });
            logger.info('Successfully saved strategy:', strategyName);
        } catch (error) {
            logger.error('Error saving strategy:', error);
            throw error;
        }
    }

    static async getSelectedStrategy() {
        logger.info('Attempting to retrieve strategy');
        try {
            const result = await chrome.storage.sync.get([SELECTED_STRATEGY_KEY]);
            logger.info('Retrieved strategy:', result[SELECTED_STRATEGY_KEY]);
            return result[SELECTED_STRATEGY_KEY];
        } catch (error) {
            logger.error('Error retrieving strategy:', error);
            throw error;
        }
    }

    static async clearSelectedStrategy() {
        logger.info('Attempting to clear strategy');
        try {
            await chrome.storage.sync.remove([SELECTED_STRATEGY_KEY]);
            logger.info('Successfully cleared strategy');
        } catch (error) {
            logger.error('Error clearing strategy:', error);
            throw error;
        }
    }

    static onStrategyChange(callback) {
        logger.info('Setting up storage change listener');
        chrome.storage.sync.onChanged.addListener((changes) => {
            if (SELECTED_STRATEGY_KEY in changes) {
                logger.info('Strategy changed in storage:', changes[SELECTED_STRATEGY_KEY].newValue);
                callback(changes[SELECTED_STRATEGY_KEY].newValue);
            }
        });
    }
}

export { StrategyStorage as default };
logger.info('Storage module loaded:', !!StrategyStorage); 