/**
 * Types for UI-related models
 * Contains interfaces for UI components and visual elements
 */

// Goal interface
export interface GoalModel {
  id: string;
  title: string;
  description?: string;
  targetAmount?: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
}

// Strategy interface
export interface StrategyModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isDefault?: boolean;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Component state interfaces
export interface ComponentState {
  isVisible: boolean;
  isActive: boolean;
  isLoading?: boolean;
  [key: string]: any;
}
