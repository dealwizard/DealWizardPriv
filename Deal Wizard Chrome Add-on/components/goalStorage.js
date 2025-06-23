import LoggerFactory from '../tools/logger.js';
import { LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/GOAL/STORAGE', LOG_LEVEL);
logger.info('Loading goal storage module');

const GOAL_KEY = 'investmentGoal';

class GoalStorage {
    static async saveGoal(goalValue) {
        logger.info('Attempting to save goal:', goalValue);
        try {
            await chrome.storage.sync.set({ [GOAL_KEY]: goalValue });
            logger.info('Successfully saved goal:', goalValue);
        } catch (error) {
            logger.error('Error saving goal:', error);
            throw error;
        }
    }

    static async getGoal() {
        logger.info('Attempting to retrieve goal');
        try {
            const result = await chrome.storage.sync.get([GOAL_KEY]);
            logger.info('Retrieved goal:', result[GOAL_KEY]);
            return result[GOAL_KEY];
        } catch (error) {
            logger.error('Error retrieving goal:', error);
            throw error;
        }
    }

    static async clearGoal() {
        logger.info('Attempting to clear goal');
        try {
            await chrome.storage.sync.remove([GOAL_KEY]);
            logger.info('Successfully cleared goal');
        } catch (error) {
            logger.error('Error clearing goal:', error);
            throw error;
        }
    }

    static onGoalChange(callback) {
        logger.info('Setting up goal storage change listener');
        chrome.storage.sync.onChanged.addListener((changes) => {
            if (GOAL_KEY in changes) {
                logger.info('Goal changed in storage:', changes[GOAL_KEY].newValue);
                callback(changes[GOAL_KEY].newValue);
            }
        });
    }
}

export { GoalStorage as default };
logger.info('Goal storage module loaded:', !!GoalStorage); 