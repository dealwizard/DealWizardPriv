import LoggerFactory from "../utils/logger";

const logger = LoggerFactory.getLogger('DEAL-WIZARD/GOAL/STORAGE');
logger.info('Loading goal storage module');

const GOAL_KEY = 'investmentGoal';

// Define interfaces for goal storage
interface GoalChangeInfo {
  oldValue?: string;
  newValue?: string;
}

interface StorageChanges {
  [key: string]: GoalChangeInfo;
}

/**
 * Class for managing investment goals in chrome storage
 */
class GoalStorage {
    /**
     * Save a goal to chrome storage
     * @param goalValue - The investment goal to save
     * @returns Promise that resolves when the goal is saved
     */
    static async saveGoal(goalValue: string): Promise<void> {
        logger.info('Attempting to save goal:', goalValue);
        try {
            await chrome.storage.sync.set({ [GOAL_KEY]: goalValue });
            logger.info('Successfully saved goal:', goalValue);
        } catch (error) {
            logger.error('Error saving goal:', error);
            throw error;
        }
    }

    /**
     * Retrieve the current investment goal from storage
     * @returns Promise that resolves with the goal value
     */
    static async getGoal(): Promise<string | undefined> {
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

    /**
     * Clear the current investment goal from storage
     * @returns Promise that resolves when the goal is cleared
     */
    static async clearGoal(): Promise<void> {
        logger.info('Attempting to clear goal');
        try {
            await chrome.storage.sync.remove([GOAL_KEY]);
            logger.info('Successfully cleared goal');
        } catch (error) {
            logger.error('Error clearing goal:', error);
            throw error;
        }
    }

    /**
     * Set up a listener for goal changes in storage
     * @param callback - Function to call when the goal changes
     */
    static onGoalChange(callback: (goalValue: string | undefined) => void): void {
        logger.info('Setting up goal storage change listener');
        chrome.storage.sync.onChanged.addListener((changes: StorageChanges) => {
            if (GOAL_KEY in changes) {
                logger.info('Goal changed in storage:', changes[GOAL_KEY].newValue);
                callback(changes[GOAL_KEY].newValue);
            }
        });
    }
}

export default GoalStorage;
logger.info('Goal storage module loaded:', !!GoalStorage);