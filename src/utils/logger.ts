enum LogLevel {
    "info",
    "warn",
    "error"
}

/**
 * 日志记录器
 * @param level 日志等级
 * @returns Logger
 * @example
 * const logger = new Logger('info');
 * logger.info('Hello World');
 * logger.warn('Hello World');
 * logger.error('Hello World');
 */

class Logger {

    protected level: "info" | "warn" | "error" = 'info';

    constructor(level: "info" | "warn" | "error" = 'info') {
        this.level = level;
    }

    info(message: string) {
        if (this.level === LogLevel[0]) {
            console.log(`${new Date().toLocaleString()} [INFO] \x1B[32m${message}\x1B[0m`);
        }
    }

    warn(message: string) {
        if (this.level === LogLevel[0] || this.level === LogLevel[1]) {
            console.log(`${new Date().toLocaleString()} [WARN] \x1B[33m${message}\x1B[0m`);
        }
    }

    error(message: string) {
        if (this.level === LogLevel[0] || this.level === LogLevel[1] || this.level === LogLevel[2]) {
            console.log(`${new Date().toLocaleString()} [ERROR] \x1B[31m${message}\x1B[0m`);
        }
    }
}

const logger = new Logger();


export default logger;