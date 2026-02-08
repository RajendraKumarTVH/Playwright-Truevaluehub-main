
export default class LoggerUtil {
    static info(message: string, data?: any) {
        if (data) {
            console.log(`[INFO] ${message}`, data);
        } else {
            console.log(`[INFO] ${message}`);
        }
    }
    static debug(message: string, data?: any) {
        if (data) {
            console.log(`[DEBUG] ${message}`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
    static error(message: string, data?: any) {
        if (data) {
            console.error(`[ERROR] ${message}`, data);
        } else {
            console.error(`[ERROR] ${message}`);
        }
    }
    static warn(message: string, data?: any) {
        if (data) {
            console.warn(`[WARN] ${message}`, data);
        } else {
            console.warn(`[WARN] ${message}`);
        }
    }
}
