"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggerUtil {
    static info(message, data) {
        if (data) {
            console.log(`[INFO] ${message}`, data);
        }
        else {
            console.log(`[INFO] ${message}`);
        }
    }
    static debug(message, data) {
        if (data) {
            console.log(`[DEBUG] ${message}`, data);
        }
        else {
            console.log(`[DEBUG] ${message}`);
        }
    }
    static error(message, data) {
        if (data) {
            console.error(`[ERROR] ${message}`, data);
        }
        else {
            console.error(`[ERROR] ${message}`);
        }
    }
    static warn(message, data) {
        if (data) {
            console.warn(`[WARN] ${message}`, data);
        }
        else {
            console.warn(`[WARN] ${message}`);
        }
    }
}
exports.default = LoggerUtil;
