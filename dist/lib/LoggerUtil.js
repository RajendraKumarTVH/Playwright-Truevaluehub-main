"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const node_path_1 = __importDefault(require("node:path"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const currentDir = __dirname;
// Go one level above (back to 'src')
const srcDir = node_path_1.default.resolve(currentDir, '..');
// Change to 'logging' folder
const loggingDir = node_path_1.default.resolve(srcDir, 'logging');
// Function to format log entries with timestamp and timezone
const customFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});
// Set the desired timezone
//const timeZone = "Europe/London"; // For the UK
// const timeZone = 'America/New_York'; // For the US
const timeZone = 'Asia/Kolkata'; // For India
const logger = winston_1.default.createLogger({
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: () => (0, moment_timezone_1.default)().tz(timeZone).format() }), customFormat),
    transports: [
        new winston_1.default.transports.Console({ level: 'debug' }),
        new winston_1.default.transports.File({
            filename: node_path_1.default.join(loggingDir, 'test_run.log'),
            maxFiles: 5, // Number of log files to retain
            maxsize: 300 * 1024, // 10 * 1024 ==10 KB, specify the size in bytes
            level: 'info'
        }),
        new winston_1.default.transports.File({
            filename: node_path_1.default.join(loggingDir, 'test_error.log'),
            maxFiles: 5, // Number of log files to retain
            maxsize: 10 * 1024, // 10 KB, specify the size in bytes
            level: 'error'
        })
    ]
});
exports.default = logger;
