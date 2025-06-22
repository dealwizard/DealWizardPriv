/**
 * Types for API responses
 * Contains interfaces for external API responses used throughout the extension
 */

// Bubble.io API interfaces
export interface BubbleStatusResponse {
  response?: BubbleStatus;
}

export interface BubbleStatus {
  reportstatus_text?: string;
  error?: string;
  [key: string]: any;
}

export interface DealResponse {
  _id?: string;
  unique_id?: string;
  uniqueId?: string; // Normalized property name
  [key: string]: any;
}

export interface WebhookResponseData {
  unique_id: string;
  [key: string]: any;
}

// Property data interfaces
export interface PropertyData {
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  squareFootage?: number;
  description?: string;
  listingId?: string;
  agent?: string;
  agency?: string;
  listingDate?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  features?: string[];
  [key: string]: any;
}
