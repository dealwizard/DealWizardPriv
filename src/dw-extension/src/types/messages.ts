/**
 * Types for extension messaging system
 * Contains interfaces for all messages and responses used in communication between 
 * content scripts, background scripts, and popup
 */

// Base message interface
export interface ExtensionMessage {
  action: string;
  payload?: any;
}

// Base response interface
export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Specific message types
export interface AnalyzeMessage extends ExtensionMessage {
  action: 'analyze';
  strategy: string;
  propertyId?: string;
  propertyUrl?: string;
  destinationUrl: string;
  investmentGoal?: string;
  parameters?: {
    purchasePrice?: number;
    renovationCost?: number;
    targetRent?: number;
    targetSalePrice?: number;
    holdingPeriod?: number;
    interestRate?: number;
    [key: string]: any;
  };
}

export interface FocusTabMessage extends ExtensionMessage {
  action: 'focusTab';
  tabId: number;
}

export interface PerformActionMessage extends ExtensionMessage {
  action: 'performAction';
}

export interface UserIdDetectedMessage extends ExtensionMessage {
  action: 'USER_ID_DETECTED';
  userId: string | null;
  timestamp: number;
  url: string;
}

// Event interfaces
export interface WizardClickEvent extends CustomEvent {
  detail: {
    goal?: string;
    [key: string]: any;
  }
}
