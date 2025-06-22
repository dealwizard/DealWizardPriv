/**
 * Types for utility functions and services
 * Contains interfaces for logger, analytics, and other utility services
 */

// Logger interfaces
export enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
}

export interface Logger {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    setLevel(level: LogLevel): void;
}

// Analytics interfaces
export interface AnalyticsEvent {
    name: string;
    category: string;
    label?: string;
    value?: number;
    properties?: Record<string, any>;
}

// API service interfaces
export interface ApiOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
}
