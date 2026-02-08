"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidNumber = isValidNumber;
exports.roundTo = roundTo;
exports.compareWithTolerance = compareWithTolerance;
exports.formatCurrency = formatCurrency;
exports.parseCurrency = parseCurrency;
exports.formatNumber = formatNumber;
exports.parseFormattedNumber = parseFormattedNumber;
exports.generateRandomId = generateRandomId;
exports.generatePartNumber = generatePartNumber;
exports.wait = wait;
exports.readNumber = readNumber;
exports.softCompare = softCompare;
exports.retry = retry;
exports.verifyCost = verifyCost;
exports.calculatePercentage = calculatePercentage;
exports.valueFromPercentage = valueFromPercentage;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.toSnakeCase = toSnakeCase;
exports.toCamelCase = toCamelCase;
exports.toNumber = toNumber;
exports.getNestedValue = getNestedValue;
exports.getISODate = getISODate;
exports.getTimestamp = getTimestamp;
exports.assert = assert;
exports.validateRequiredFields = validateRequiredFields;
exports.mmToInches = mmToInches;
exports.inchesToMm = inchesToMm;
exports.kgToLbs = kgToLbs;
exports.lbsToKg = lbsToKg;
exports.calculateBoxVolume = calculateBoxVolume;
exports.calculateCylinderVolume = calculateCylinderVolume;
exports.calculateWeight = calculateWeight;
exports.normalizeMachineType = normalizeMachineType;
exports.normalizeEfficiency = normalizeEfficiency;
exports.computeMaterialWeight = computeMaterialWeight;
exports.computeWeldWeightWithWastage = computeWeldWeightWithWastage;
exports.getTotalWeldLength = getTotalWeldLength;
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const test_1 = require("@playwright/test");
let page;
const logger = LoggerUtil_1.default;
/**
 * Validates a number and returns 0 if invalid
 */
function isValidNumber(n) {
    return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
        ? 0
        : Number(Number(n).toFixed(4));
}
/**
 * Rounds a number to specified decimal places
 */
function roundTo(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
/**
 * Compares two numbers within a tolerance
 */
function compareWithTolerance(actual, expected, tolerance = 0.01) {
    return Math.abs(actual - expected) <= tolerance;
}
/**
 * Formats a number as currency
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);
}
/**
 * Parses a currency string to number
 */
function parseCurrency(value) {
    return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}
/**
 * Formats a number with commas
 */
function formatNumber(value, decimals = 2) {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
/**
 * Parses a formatted number string to number
 */
function parseFormattedNumber(value) {
    return parseFloat(value.replace(/,/g, ''));
}
/**
 * Generates a random alphanumeric string
 */
function generateRandomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Generates a unique part number
 */
function generatePartNumber(prefix = 'TEST') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = generateRandomId(4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}
/**
 * Waits for specified milliseconds
 */
function wait(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
function readNumber(locator_1) {
    return __awaiter(this, arguments, void 0, function* (locator, fallback = 0) {
        try {
            if (yield locator.isVisible()) {
                const val = yield locator.inputValue();
                return Number(val === null || val === void 0 ? void 0 : val.replace(/,/g, '')) || fallback;
            }
        }
        catch (_a) { }
        return fallback;
    });
}
function softCompare(label, actual, expected, precision = 2) {
    logger.info(`🔎 ${label} → Expected: ${expected}, Actual: ${actual}`);
    test_1.expect.soft(actual).toBeCloseTo(expected, precision);
}
/**
 * Retries an async function until it succeeds or max attempts reached
 */
function retry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, maxAttempts = 3, delayMs = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return yield fn();
            }
            catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    yield wait(delayMs);
                }
            }
        }
        throw lastError;
    });
}
function verifyCost(label_1, locator_1, expected_1) {
    return __awaiter(this, arguments, void 0, function* (label, locator, expected, precision = 2, calculate) {
        logger.info(`🔹 Verifying ${label}...`);
        const actual = yield readNumber(locator);
        let exp = expected;
        if (exp === undefined && calculate) {
            exp = yield calculate();
        }
        if (exp !== undefined) {
            softCompare(label, actual, exp, precision);
        }
        logger.info(`✔ ${label} verified: ${actual}`);
    });
}
/**
 * Calculates percentage
 */
function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return roundTo((value / total) * 100, 2);
}
/**
 * Calculates value from percentage
 */
function valueFromPercentage(total, percentage) {
    return roundTo((total * percentage) / 100, 4);
}
/**
 * Deep clones an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Merges two objects deeply
 */
function deepMerge(target, source) {
    const result = Object.assign({}, target);
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const targetValue = target[key];
            const sourceValue = source[key];
            if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
                result[key] = deepMerge(targetValue || {}, sourceValue);
            }
            else if (sourceValue !== undefined) {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * Converts object keys to snake_case
 */
function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}
/**
 * Converts object keys to camelCase
 */
function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
function toNumber(value) {
    const n = Number(value);
    return isNaN(n) ? 0 : n; // return 0 instead of NaN for safety
}
/**
 * Safely gets a nested property value
 */
function getNestedValue(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null)
            return defaultValue;
        result = result[key];
    }
    return result !== null && result !== void 0 ? result : defaultValue;
}
/**
 * Creates a date string in ISO format
 */
function getISODate(date = new Date()) {
    return date.toISOString().split('T')[0];
}
/**
 * Creates a timestamp string for logging
 */
function getTimestamp() {
    return new Date().toISOString();
}
/**
 * Assertion helper - throws if condition is false
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
/**
 * Validates required fields exist in an object
 */
function validateRequiredFields(obj, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
        const value = getNestedValue(obj, field);
        if (value === undefined || value === null || value === '') {
            missing.push(field);
        }
    }
    return missing;
}
/**
 * Converts mm to inches
 */
function mmToInches(mm) {
    return roundTo(mm / 25.4, 4);
}
/**
 * Converts inches to mm
 */
function inchesToMm(inches) {
    return roundTo(inches * 25.4, 4);
}
/**
 * Converts kg to lbs
 */
function kgToLbs(kg) {
    return roundTo(kg * 2.20462, 4);
}
/**
 * Converts lbs to kg
 */
function lbsToKg(lbs) {
    return roundTo(lbs / 2.20462, 4);
}
/**
 * Calculates volume of a rectangular prism
 */
function calculateBoxVolume(length, width, height) {
    return roundTo(length * width * height, 4);
}
/**
 * Calculates volume of a cylinder
 */
function calculateCylinderVolume(diameter, length) {
    const radius = diameter / 2;
    return roundTo(Math.PI * radius * radius * length, 4);
}
/**
 * Calculates weight from volume and density
 */
function calculateWeight(volumeMm3, densityGPerCm3) {
    // Volume in mm³, density in g/cm³
    // 1 cm³ = 1000 mm³
    return roundTo((volumeMm3 / 1000) * densityGPerCm3, 4);
}
function normalizeMachineType(type) {
    const t = String(type).toLowerCase();
    // Map numeric strings/enum values if present
    if (t === '1' || t === 'automatic')
        return 'Automatic';
    if (t === '3' || t === 'manual')
        return 'Manual';
    if (t === '2' || t === 'semi-auto' || t === 'semiauto')
        return 'Semi-Auto';
    // Fallback logic
    if (t.includes('auto') && !t.includes('semi'))
        return 'Automatic';
    if (t.includes('manual'))
        return 'Manual';
    return 'Semi-Auto';
}
function normalizeEfficiency(efficiency) {
    if (!efficiency || efficiency <= 0)
        return 1;
    return efficiency > 1 ? efficiency / 100 : efficiency;
}
function computeMaterialWeight(partVolume, density) {
    return (partVolume * density) / 1000; // kg
}
function computeWeldWeightWithWastage(grossWeight, efficiency) {
    const eff = normalizeEfficiency(efficiency) / 100; // convert to fraction
    return grossWeight / eff;
}
function getTotalWeldLength(weldLength, weldPlaces, weldSide, noOfPasses = 1) {
    let sideMultiplier = 1;
    if (typeof weldSide === 'string')
        sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1;
    else if (typeof weldSide === 'number')
        sideMultiplier = weldSide === 2 ? 2 : 1;
    return weldLength * weldPlaces * noOfPasses * sideMultiplier;
}
