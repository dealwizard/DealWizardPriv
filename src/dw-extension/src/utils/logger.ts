import { Logger as ILogger, LogLevel } from '../types/utils';
import { ConfigService } from './config';

class Logger implements ILogger {
  context: string;
  level: LogLevel;

  constructor(context: string, level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = ConfigService.isDebugEnabled() ? LogLevel.DEBUG : level;
  }
  log(...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.log(`[INFO] [${this.context}] `, ...args);
    }
  }

  setLevel(level: LogLevel): Logger {
    this.level = level;
    return this;
  }

  trace(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.TRACE) {
      console.debug(`[TRACE] [${this.context}] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] [${this.context}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] [${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] [${this.context}] ${message}`, ...args);
    }
  }
}

class LoggerFactory {
  static #instances: Map<string, Logger> = new Map();
  static #defaultLevel: LogLevel = LogLevel.INFO;

  static setDefaultLevel(level: LogLevel): void {
    this.#defaultLevel = level;
    // Update all existing loggers
    this.#instances.forEach(logger => logger.setLevel(level));
  }

  static getLogger(context: string): Logger {
    if (!this.#instances.has(context)) {
      this.#instances.set(context, new Logger(context, this.#defaultLevel));
    }
    return this.#instances.get(context)!;
  }

  static setLevelForContext(context: string, level: LogLevel): void {
    if (this.#instances.has(context)) {
      this.#instances.get(context)!.setLevel(level);
    }
  }

  static getAllContexts(): string[] {
    return Array.from(this.#instances.keys());
  }
}

export { LoggerFactory as default, Logger, LogLevel };

