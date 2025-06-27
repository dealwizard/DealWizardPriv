/**
 * Deal model
 * Represents an investment deal created from a property listing
 */

import { PropertyData } from '../types';

export class DealModel {
  id: string;
  property: PropertyData;
  strategy: string;
  analysisDate: Date;
  metrics: {
    roi?: number;
    cashFlow?: number;
    capRate?: number;
    irr?: number;
    cocReturn?: number;
    grossYield?: number;
    [key: string]: number | undefined;
  };

  constructor(id: string, property: PropertyData, strategy: string) {
    this.id = id;
    this.property = property;
    this.strategy = strategy;
    this.analysisDate = new Date();
    this.metrics = {};
  }
}
