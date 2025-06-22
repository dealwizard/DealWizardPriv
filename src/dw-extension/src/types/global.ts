/**
 * Global type declarations and window interfaces
 * Contains interfaces for extending the global Window object
 */

import Deal from '../components/deal';
import Goal from '../components/goal';
import GoalStorage from '../components/goalStorage';
import Strategy from '../components/strategy';
import StrategyStorage from '../components/strategyStorage';
import Toast from '../components/toast';
import Wizard from '../components/wizzard';

// Extend Window interface with our components
declare global {
  interface Window {
    Toast: typeof Toast;
    StrategyStorage: typeof StrategyStorage;
    GoalStorage: typeof GoalStorage;
    Strategy: typeof Strategy;
    Deal: typeof Deal;
    Goal: typeof Goal;
    Wizard: typeof Wizard;
    CurrentGoal: string;
  }
}

// Export empty object to make this a module
export { };

