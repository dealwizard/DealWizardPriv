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
    }

    setLevel(level) {
        this.level = level;
        return this;
    }

    trace(message, ...args) {
        if (this.level >= LogLevel.TRACE) {
            console.debug(`[TRACE] [${this.context}] ${message}`, ...args);
        }
    }

    debug(message, ...args) {
        if (this.level >= LogLevel.DEBUG) {
            console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
        }
    }

    info(message, ...args) {
        if (this.level >= LogLevel.INFO) {
            console.info(`[INFO] [${this.context}] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        if (this.level >= LogLevel.WARN) {
            console.warn(`[WARN] [${this.context}] ${message}`, ...args);
        }
    }

    error(message, ...args) {
        if (this.level >= LogLevel.ERROR) {
            console.error(`[ERROR] [${this.context}] ${message}`, ...args);
        }
    }
}

class LoggerFactory {
    static #instances = new Map();
    static #defaultLevel = LogLevel.INFO;

    static setDefaultLevel(level) {
        this.#defaultLevel = level;
        // Update all existing loggers
        this.#instances.forEach(logger => logger.setLevel(level));
    }

    static getLogger(context) {
        if (!this.#instances.has(context)) {
            this.#instances.set(context, new Logger(context, this.#defaultLevel));
        }
        return this.#instances.get(context);
    }

    static setLevelForContext(context, level) {
        if (this.#instances.has(context)) {
            this.#instances.get(context).setLevel(level);
        }
    }

    static getAllContexts() {
        return Array.from(this.#instances.keys());
    }
}

export { LoggerFactory as default, LogLevel }; 