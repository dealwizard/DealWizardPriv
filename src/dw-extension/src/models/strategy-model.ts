/**
 * Strategy model
 * Represents an investment strategy
 */

import { StrategyModel as IStrategyModel } from '../types';

export class StrategyModel implements IStrategyModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isDefault?: boolean;
  parameters: Record<string, any>;

  constructor(id: string, name: string, description: string, icon?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.isDefault = false;
    this.parameters = {};
  }

  /**
   * Create a flip strategy
   */
  static createFlipStrategy(): StrategyModel {
    const strategy = new StrategyModel(
      'flip',
      'FLIP',
      'Buy, renovate, and sell for profit',
      'flip.png'
    );
    strategy.isDefault = true;
    strategy.parameters = {
      renovationCost: 0,
      holdingPeriod: 3, // months
      targetSellingPrice: 0,
      sellingCosts: 0.02, // 2% of selling price
    };
    return strategy;
  }

  /**
   * Create a Buy-To-Let strategy
   */
  static createBTLStrategy(): StrategyModel {
    const strategy = new StrategyModel(
      'btl',
      'BTL',
      'Buy and rent for long-term income',
      'btl.png'
    );
    strategy.parameters = {
      targetRent: 0,
      managementFee: 0.1, // 10% of rent
      annualMaintenance: 0.01, // 1% of property value
      vacancyRate: 0.08, // 8% vacancy
    };
    return strategy;
  }

  /**
   * Create an HMO strategy
   */
  static createHMOStrategy(): StrategyModel {
    const strategy = new StrategyModel(
      'hmo',
      'HMO',
      'House in Multiple Occupation for higher yields',
      'hmo.png'
    );
    strategy.parameters = {
      numberOfRooms: 4,
      rentPerRoom: 0,
      licensingCost: 0,
      annualMaintenance: 0.015, // 1.5% of property value
      managementFee: 0.12, // 12% of rent
      vacancyRate: 0.1, // 10% vacancy
    };
    return strategy;
  }

  /**
   * Convert to plain object for storage
   */
  toObject(): IStrategyModel {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      isDefault: this.isDefault
    };
  }

  /**
   * Create a StrategyModel from a plain object
   */
  static fromObject(obj: IStrategyModel): StrategyModel {
    const strategy = new StrategyModel(obj.id, obj.name, obj.description, obj.icon);
    if (obj.isDefault !== undefined) {
      strategy.isDefault = obj.isDefault;
    }
    return strategy;
  }
}
