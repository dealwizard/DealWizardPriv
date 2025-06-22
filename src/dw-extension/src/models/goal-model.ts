/**
 * Goal model
 * Represents an investment goal set by the user
 */

import { GoalModel as IGoalModel } from '../types';

export class GoalModel implements IGoalModel {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  deadline?: string;
  isActive: boolean;
  createdAt: string;
  progress?: number;

  constructor(title: string, description: string = '', targetAmount?: number, deadline?: string) {
    this.id = this.generateId();
    this.title = title;
    this.description = description;
    this.targetAmount = targetAmount;
    this.deadline = deadline;
    this.isActive = true;
    this.createdAt = new Date().toISOString();
    this.progress = 0;
  }

  /**
   * Generate a unique ID for the goal
   */
  private generateId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update the progress of the goal
   */
  updateProgress(value: number): void {
    if (this.targetAmount) {
      this.progress = Math.min(100, (value / this.targetAmount) * 100);
    }
  }

  /**
   * Convert to a plain object for storage
   */
  toObject(): IGoalModel {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      targetAmount: this.targetAmount,
      deadline: this.deadline,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  /**
   * Create a GoalModel instance from a plain object
   */
  static fromObject(obj: IGoalModel): GoalModel {
    const goal = new GoalModel(obj.title, obj.description, obj.targetAmount, obj.deadline);
    goal.id = obj.id;
    goal.isActive = obj.isActive;
    goal.createdAt = obj.createdAt;
    return goal;
  }
}
