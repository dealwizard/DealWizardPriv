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

  /**
   * Calculate the ROI for the deal
   */
  calculateROI(): number {
    // Implementation would go here
    const roi = 0; // Placeholder
    this.metrics.roi = roi;
    return roi;
  }

  /**
   * Get the destination URL for the deal analysis
   */
  getDestinationUrl(): string {
    //return `https://deal-wizard-home-61532.bubbleapps.io/new_product_page/${this.id}`;
    return `https://deal-wizard-home-61532.bubbleapps.io/version-test/new_product_page/${this.id}`
  }
}
