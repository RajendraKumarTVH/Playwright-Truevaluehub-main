import Logger from '../lib/LoggerUtil'
import { expect, type Locator } from "@playwright/test";
import { Page } from "@playwright/test";
let page: Page
const logger = Logger;

/**
 * Validates a number and returns 0 if invalid
 */
export function isValidNumber(n: any): number {
    return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
        ? 0
        : Number(Number(n).toFixed(4));
}

/**
 * Rounds a number to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Compares two numbers within a tolerance
 */
export function compareWithTolerance(actual: number, expected: number, tolerance: number = 0.01): boolean {
    return Math.abs(actual - expected) <= tolerance;
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Parses a currency string to number
 */
export function parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, ''));
}

/**
 * Formats a number with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Parses a formatted number string to number
 */
export function parseFormattedNumber(value: string): number {
    return parseFloat(value.replace(/,/g, ''));
}

/**
 * Generates a random alphanumeric string
 */
export function generateRandomId(length: number = 8): string {
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
export function generatePartNumber(prefix: string = 'TEST'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = generateRandomId(4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Waits for specified milliseconds
 */
export async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function readNumber(locator: Locator, fallback = 0): Promise<number> {
    try {
        if (await locator.isVisible()) {
            const val = await locator.inputValue()
            return Number(val?.replace(/,/g, '')) || fallback
        }
    } catch { }
    return fallback
}
export function softCompare(
    label: string,
    actual: number,
    expected: number,
    precision = 2
) {
    logger.info(`🔎 ${label} → Expected: ${expected}, Actual: ${actual}`)
    expect.soft(actual).toBeCloseTo(expected, precision)
}


/**
 * Retries an async function until it succeeds or max attempts reached
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxAttempts) {
                await wait(delayMs);
            }
        }
    }
    throw lastError;
}
export async function verifyCost(
    label: string,
    locator: Locator,
    expected?: number,
    precision = 2,
    calculate?: () => Promise<number>
) {
    logger.info(`🔹 Verifying ${label}...`)
    const actual = await readNumber(locator)

    let exp = expected
    if (exp === undefined && calculate) {
        exp = await calculate()
    }

    if (exp !== undefined) {
        softCompare(label, actual, exp, precision)
    }

    logger.info(`✔ ${label} verified: ${actual}`)
}

/**
 * Calculates percentage
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return roundTo((value / total) * 100, 2);
}

/**
 * Calculates value from percentage
 */
export function valueFromPercentage(total: number, percentage: number): number {
    return roundTo((total * percentage) / 100, 4);
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merges two objects deeply
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const targetValue = (target as any)[key];
            const sourceValue = (source as any)[key];
            if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
                (result as any)[key] = deepMerge(targetValue || {}, sourceValue);
            } else if (sourceValue !== undefined) {
                (result as any)[key] = sourceValue;
            }
        }
    }
    return result;
}

/**
 * Converts object keys to snake_case
 */
export function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converts object keys to camelCase
 */
export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
export function toNumber(value: string): number {
    const n = Number(value);
    return isNaN(n) ? 0 : n;   // return 0 instead of NaN for safety
}

/**
 * Safely gets a nested property value
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null) return defaultValue;
        result = result[key];
    }
    return result ?? defaultValue;
}

/**
 * Creates a date string in ISO format
 */
export function getISODate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
}

/**
 * Creates a timestamp string for logging
 */
export function getTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Assertion helper - throws if condition is false
 */
export function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Validates required fields exist in an object
 */
export function validateRequiredFields(obj: any, requiredFields: string[]): string[] {
    const missing: string[] = [];
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
export function mmToInches(mm: number): number {
    return roundTo(mm / 25.4, 4);
}

/**
 * Converts inches to mm
 */
export function inchesToMm(inches: number): number {
    return roundTo(inches * 25.4, 4);
}

/**
 * Converts kg to lbs
 */
export function kgToLbs(kg: number): number {
    return roundTo(kg * 2.20462, 4);
}

/**
 * Converts lbs to kg
 */
export function lbsToKg(lbs: number): number {
    return roundTo(lbs / 2.20462, 4);
}

/**
 * Calculates volume of a rectangular prism
 */
export function calculateBoxVolume(length: number, width: number, height: number): number {
    return roundTo(length * width * height, 4);
}

/**
 * Calculates volume of a cylinder
 */
export function calculateCylinderVolume(diameter: number, length: number): number {
    const radius = diameter / 2;
    return roundTo(Math.PI * radius * radius * length, 4);
}

/**
 * Calculates weight from volume and density
 */
export function calculateWeight(volumeMm3: number, densityGPerCm3: number): number {
    // Volume in mm³, density in g/cm³
    // 1 cm³ = 1000 mm³
    return roundTo((volumeMm3 / 1000) * densityGPerCm3, 4);
}

export function normalizeMachineType(type: string | number): 'Automatic' | 'Manual' | 'Semi-Auto' {
    const t = String(type).toLowerCase();

    // Map numeric strings/enum values if present
    if (t === '1' || t === 'automatic') return 'Automatic';
    if (t === '3' || t === 'manual') return 'Manual';
    if (t === '2' || t === 'semi-auto' || t === 'semiauto') return 'Semi-Auto';

    // Fallback logic
    if (t.includes('auto') && !t.includes('semi')) return 'Automatic';
    if (t.includes('manual')) return 'Manual';
    return 'Semi-Auto';
}
export function normalizeEfficiency(efficiency?: number): number {
    if (!efficiency || efficiency <= 0) return 1
    return efficiency > 1 ? efficiency / 100 : efficiency
}
export function computeMaterialWeight(partVolume: number, density: number): number {
    return (partVolume * density) / 1000; // kg
}

export function computeWeldWeightWithWastage(grossWeight: number, efficiency: number): number {
    const eff = normalizeEfficiency(efficiency) / 100; // convert to fraction
    return grossWeight / eff;
}
export function getTotalWeldLength(weldLength: number, weldPlaces: number, weldSide: string | number, noOfPasses: number = 1): number {
    let sideMultiplier = 1;
    if (typeof weldSide === 'string') sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1;
    else if (typeof weldSide === 'number') sideMultiplier = weldSide === 2 ? 2 : 1;
    return weldLength * weldPlaces * noOfPasses * sideMultiplier;
}
