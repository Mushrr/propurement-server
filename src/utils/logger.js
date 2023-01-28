"use strict";
exports.__esModule = true;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["info"] = 0] = "info";
    LogLevel[LogLevel["warn"] = 1] = "warn";
    LogLevel[LogLevel["error"] = 2] = "error";
})(LogLevel || (LogLevel = {}));
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
var Logger = /** @class */ (function () {
    function Logger(level) {
        if (level === void 0) { level = 'info'; }
        this.level = 'info';
        this.level = level;
    }
    Logger.prototype.info = function (message) {
        if (this.level === LogLevel[0]) {
            console.log("".concat(new Date().toLocaleString(), " [INFO] \u001B[32m").concat(message, "\u001B[0m"));
        }
    };
    Logger.prototype.warn = function (message) {
        if (this.level === LogLevel[0] || this.level === LogLevel[1]) {
            console.log("".concat(new Date().toLocaleString(), " [WARN] \u001B[33m").concat(message, "\u001B[0m"));
        }
    };
    Logger.prototype.error = function (message) {
        if (this.level === LogLevel[0] || this.level === LogLevel[1] || this.level === LogLevel[2]) {
            console.log("".concat(new Date().toLocaleString(), " [ERROR] \u001B[31m").concat(message, "\u001B[0m"));
        }
    };
    return Logger;
}());
var logger = new Logger();
exports["default"] = logger;
