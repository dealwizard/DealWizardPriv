// Verbosity levels
const LogLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
};

class Logger {
    constructor(context, level = LogLevel.INFO) {
        this.context = context;
        this.level = level;
        this._validateLevel(level);
    }

    _validateLevel(level) {
        if (typeof level !== 'number' || level < LogLevel.ERROR || level > LogLevel.TRACE) {
            console.warn(`[LOGGER] Invalid log level ${level} for context ${this.context}, defaulting to INFO`);
            this.level = LogLevel.INFO;
        }
    }

    setLevel(level) {
        this._validateLevel(level);
        this.level = level;
        return this;
    }

    _safeConsoleCall(method, message, ...args) {
        try {
            if (typeof console[method] === 'function') {
                console[method](`[${method.toUpperCase()}] [${this.context}] ${message}`, ...args);
            } else {
                // Fallback to console.log if specific method is not available
                console.log(`[${method.toUpperCase()}] [${this.context}] ${message}`, ...args);
            }
        } catch (error) {
            // Last resort fallback
            console.log(`[LOGGER ERROR] Failed to log message for ${this.context}: ${message}`);
        }
    }

    trace(message, ...args) {
        if (this.level >= LogLevel.TRACE) {
            this._safeConsoleCall('debug', message, ...args);
        }
    }

    debug(message, ...args) {
        if (this.level >= LogLevel.DEBUG) {
            this._safeConsoleCall('debug', message, ...args);
        }
    }

    info(message, ...args) {
        if (this.level >= LogLevel.INFO) {
            this._safeConsoleCall('info', message, ...args);
        }
    }

    warn(message, ...args) {
        if (this.level >= LogLevel.WARN) {
            this._safeConsoleCall('warn', message, ...args);
        }
    }

    error(message, ...args) {
        if (this.level >= LogLevel.ERROR) {
            this._safeConsoleCall('error', message, ...args);
        }
    }
}

class LoggerFactory {
    constructor() {
        if (LoggerFactory.instance) {
            return LoggerFactory.instance;
        }
        LoggerFactory.instance = this;
        this.instances = new Map();
        this.defaultLevel = LogLevel.INFO;
    }

    static getInstance() {
        if (!LoggerFactory.instance) {
            LoggerFactory.instance = new LoggerFactory();
        }
        return LoggerFactory.instance;
    }

    setDefaultLevel(level) {
        if (typeof level !== 'number' || level < LogLevel.ERROR || level > LogLevel.TRACE) {
            console.warn(`[LOGGER] Invalid default log level ${level}, keeping current level ${this.defaultLevel}`);
            return;
        }
        this.defaultLevel = level;
        // Update all existing loggers
        this.instances.forEach(logger => logger.setLevel(level));
    }

    getLogger(context, level) {
        if (!context || typeof context !== 'string') {
            console.warn('[LOGGER] Invalid context provided to getLogger');
            context = 'UNKNOWN';
        }

        if (!this.instances.has(context)) {
            const loggerLevel = typeof level === 'number' ? level : this.defaultLevel;
            this.instances.set(context, new Logger(context, loggerLevel));
        } else if (typeof level === 'number') {
            // Update level if provided
            this.instances.get(context).setLevel(level);
        }
        return this.instances.get(context);
    }

    setLevelForContext(context, level) {
        if (this.instances.has(context)) {
            this.instances.get(context).setLevel(level);
        }
    }

    getAllContexts() {
        return Array.from(this.instances.keys());
    }
}

// Export a singleton instance
const loggerFactory = new LoggerFactory();
export { loggerFactory as default, LogLevel }; 