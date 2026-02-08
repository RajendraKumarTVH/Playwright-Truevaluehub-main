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
exports.VerificationHelper = exports.BasePage = void 0;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("./LoggerUtil"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const logger = LoggerUtil_1.default;
class BasePage {
    constructor(page, context) {
        this.getLocatorText = (locator) => __awaiter(this, void 0, void 0, function* () {
            const text = (yield locator.innerText()) || (yield locator.textContent());
            return ((text === null || text === void 0 ? void 0 : text.trim().replace(/\n/g, ' ')) || '').replace(/\s{2,}/g, ' ');
        });
        this.getLocatorInputValue = (locator) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = (yield locator.inputValue())) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        });
        this.page = page;
        this.context = context;
    }
    isPageClosed() {
        return this.page.isClosed();
    }
    // ==================== NAVIGATION ====================
    /**
     * Navigate to a specific URL
     */
    navigateTo(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(url);
            yield this.page.waitForLoadState('networkidle');
            logger.info(`✔ Navigated to: ${url}`);
        });
    }
    safeClick(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible' });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.hover();
            try {
                yield locator.click({ timeout: 3000 });
            }
            catch (_a) {
                yield locator.evaluate(el => el.click());
            }
        });
    }
    /**
     * Wait for page to fully load
     */
    waitForPageLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForLoadState('networkidle');
            yield this.page.waitForLoadState('domcontentloaded');
        });
    }
    // ==================== ELEMENT INTERACTIONS ====================
    /**
     * Wait for element, clear, fill, and tab out
     */
    waitAndFill(selector, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
            if (!element) {
                throw new Error('❌ Element not found or selector is invalid.');
            }
            yield element.waitFor({ state: 'visible', timeout: 15000 });
            const text = String(value);
            yield element.fill(text);
            console.log(`✅ Filled text "${text}" into input`);
        });
    }
    safeFill(locator, value, fieldName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return VerificationHelper.safeFill(locator, value, fieldName, options);
        });
    }
    waitAndClick(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 10000 });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.click({ force: true });
        });
    }
    ifNeededScrollAndClick(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 10000) {
            yield locator.waitFor({ state: 'visible', timeout });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.click({ force: true });
        });
    }
    selectOption(locator_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (locator, label, timeout = 15000) {
            if (!label) {
                throw new Error('Label is required to select an option');
            }
            try {
                yield (0, test_1.expect)(locator).toBeVisible({ timeout });
                yield locator.selectOption({ label });
                console.log(`✅ Successfully selected option "${label}"`);
            }
            catch (error) {
                console.error(`❌ Failed to select option "${label}"`, error);
                throw error;
            }
        });
    }
    getSelectedOptionText(dropdown_1) {
        return __awaiter(this, arguments, void 0, function* (dropdown, timeout = 10000) {
            try {
                // Ensure dropdown is attached and visible
                yield dropdown.waitFor({ state: 'attached', timeout });
                yield dropdown.waitFor({ state: 'visible', timeout });
                // Use evaluate to get the text of the selected option directly
                // This avoids strict mode violations if multiple options have the same value
                const text = yield dropdown.evaluate((el) => {
                    if (el.selectedIndex === -1)
                        return '';
                    return el.options[el.selectedIndex].text;
                });
                return (text === null || text === void 0 ? void 0 : text.trim()) || '';
            }
            catch (err) {
                console.error(`❌ Failed to get selected option text: ${err.message}`);
                return '';
            }
        });
    }
    scrollToMiddle(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield locator.waitFor({ state: 'attached', timeout: 5000 });
                yield locator.evaluate(el => {
                    el.scrollIntoView({ block: 'center', inline: 'center' });
                });
            }
            catch (err) {
                console.warn(`⚠️ Failed to scroll element to middle: ${err.message}`);
            }
        });
    }
    selectOptionByValue(locator_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (locator, value, timeout = 15000) {
            yield locator.waitFor({ state: 'visible', timeout });
            yield (0, test_1.expect)(locator).toBeEnabled({ timeout });
            yield locator.selectOption({ value });
        });
    }
    scrollElementToTop(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.evaluate(el => {
                el.scrollIntoView({ block: 'start', inline: 'nearest' });
            });
        });
    }
    waitForSelector(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForSelector(selector);
        });
    }
    waitForVisible(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 10000) {
            yield locator.waitFor({ state: 'visible', timeout });
        });
    }
    expandPanelIfCollapsed(panelToggle, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield panelToggle.isVisible()))
                return;
            if (yield this.isPanelCollapsed(panelToggle)) {
                yield panelToggle.scrollIntoViewIfNeeded();
                yield panelToggle.click({ force: true });
                if (content) {
                    yield (0, test_1.expect)(content).toBeVisible({ timeout: 5000 });
                }
            }
        });
    }
    expandWeldIfVisible(weldHeader, targetInput, label) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔽 Ensuring ${label} is expanded`);
            // Already expanded
            if (yield targetInput.isVisible().catch(() => false)) {
                logger.info(`✅ ${label} already expanded`);
                return;
            }
            yield weldHeader.waitFor({ state: 'visible', timeout: 10000 });
            yield weldHeader.scrollIntoViewIfNeeded();
            for (let attempt = 1; attempt <= 3; attempt++) {
                logger.debug(`Attempt ${attempt} to expand ${label}`);
                yield weldHeader.click({ force: true });
                // ✅ Let Angular finish change detection
                yield (0, test_1.expect)(targetInput).toBeVisible({ timeout: 3000 });
                logger.info(`✅ ${label} expanded successfully`);
                return;
            }
            throw new Error(`❌ Failed to expand ${label} - content not visible`);
        });
    }
    expandSectionIfVisible(sectionToggle, label) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield sectionToggle.isVisible()) {
                    yield this.expandPanelIfCollapsed(sectionToggle);
                    logger.info(`✅ Checked/Expanded section: ${label}`);
                }
                else {
                    logger.debug(`ℹ️ Section toggle hidden: ${label}`);
                }
            }
            catch (err) {
                logger.warn(`⚠️ Failed to expand section ${label}: ${err.message}`);
            }
        });
    }
    isPanelCollapsed(panel) {
        return __awaiter(this, void 0, void 0, function* () {
            const ariaExpanded = yield panel.getAttribute('aria-expanded');
            return ariaExpanded === 'false';
        });
    }
    validateCalculatedField(actualLocator_1, expected_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (actualLocator, expected, label, precision = 2) {
            const actual = Number((yield actualLocator.inputValue()) || '0');
            logger.info(`[${label}] UI: ${actual}, Expected: ${expected}`);
            test_1.expect.soft(actual).toBeCloseTo(expected, precision);
        });
    }
    /**
     * Instance helper for UI verification
     */
    verifyUIValue(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield VerificationHelper.verifyUIValue(this.page, config.locator, config);
        });
    }
    typeWithDelay(locator_1, text_1) {
        return __awaiter(this, arguments, void 0, function* (locator, text, delay = 50) {
            yield locator.waitFor({ state: 'visible', timeout: 10000 });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.click();
            yield this.page.keyboard.type(text, { delay });
        });
    }
    // ==================== VALUE GETTERS ====================
    /**
     * Get input value as string
     */
    getInputValue(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 10000 });
            return (yield locator.inputValue()) || '';
        });
    }
    /**
     * Get input value as number
     */
    getInputValueAsNumber(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.getInputValue(locator);
            return parseFloat(value.replace(/,/g, '')) || 0;
        });
    }
    getInputNumber(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readNumber('Input', locator);
        });
    }
    readNumber(label, locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 10000 });
            const value = yield this.getInputValueAsNumber(locator);
            logger.info(`   ▶ ${label} → Raw Value: ${value}`);
            test_1.expect
                .soft(Number.isFinite(value), `❌ ${label} should be a valid number but received: ${value}`)
                .toBeTruthy();
            return value !== null && value !== void 0 ? value : 0;
        });
    }
    /**
     * Get text content of element
     */
    getTextContent(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 10000 });
            return (yield locator.textContent()) || '';
        });
    }
    // ==================== VISIBILITY & STATE ====================
    /**
     * Check if element is visible
     */
    isVisible(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield locator.waitFor({ state: 'visible', timeout: 10000 });
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    /**
     * Check if element is enabled
     */
    isEnabled(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 5000 });
            return yield locator.isEnabled();
        });
    }
    /**
     * Wait for element to be hidden
     */
    waitForHidden(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 5000) {
            yield locator.waitFor({ state: 'hidden', timeout });
        });
    }
    // ==================== SCROLLING ====================
    /**
     * Scroll element into view
     */
    scrollIntoView(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.scrollIntoViewIfNeeded();
            yield this.page.waitForTimeout(100);
        });
    }
    /**
     * Scroll to bottom of page
     */
    scrollToBottom() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            yield this.page.waitForTimeout(200);
        });
    }
    /**
     * Scroll to top of page
     */
    scrollToTop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.evaluate(() => window.scrollTo(0, 0));
            yield this.page.waitForTimeout(200);
        });
    }
    // ==================== WAITING ====================
    /**
     * Wait for specified milliseconds
     */
    wait(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForTimeout(ms);
        });
    }
    /**
     * Wait for network idle
     */
    waitForNetworkIdle() {
        return __awaiter(this, arguments, void 0, function* (timeout = 10000) {
            try {
                yield this.page.waitForLoadState('networkidle', { timeout });
            }
            catch (err) {
                logger.warn(`⚠️ Network idle timeout reached (${timeout}ms). Proceeding...`);
            }
        });
    }
    // ==================== SCREENSHOTS ====================
    /**
     * Capture screenshot with filename
     */
    captureScreenshot(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.screenshot({ path: `${name}.png`, fullPage: true });
            logger.info(`✔ Screenshot captured: ${name}.png`);
        });
    }
    waitForTimeout(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    } /**
     * Capture screenshot on error
     */
    captureErrorScreenshot(testName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.screenshot({
                path: `${testName}_error.png`,
                fullPage: true
            });
            logger.error(`Screenshot captured for error: ${testName}_error.png`);
        });
    }
    // ==================== KEYBOARD ACTIONS ====================
    /**
     * Press keyboard key
     */
    pressKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press(key);
        });
    }
    /**
     * Press Tab key
     */
    pressTab() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press('Tab');
        });
    }
    /**
     * Press Enter key
     */
    pressEnter() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press('Enter');
        });
    }
    /**
     * Press Escape key
     */
    pressEscape() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.keyboard.press('Escape');
        });
    }
    // ==================== ASSERTIONS ====================
    /**
     * Assert element is visible
     */
    assertVisible(locator, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, test_1.expect)(locator, message).toBeVisible({ timeout: 10000 });
        });
    }
    /**
     * Assert element has text
     */
    assertHasText(locator, text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, test_1.expect)(locator).toContainText(text, { timeout: 10000 });
        });
    }
    /**
     * Assert input has value
     */
    assertInputValue(locator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, test_1.expect)(locator).toHaveValue(value, { timeout: 10000 });
        });
    }
    /**
     * Assert element is not visible
     */
    assertNotVisible(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, test_1.expect)(locator).not.toBeVisible({ timeout: 5000 });
        });
    }
    expectInputValue(locator, expected) {
        return __awaiter(this, void 0, void 0, function* () {
            const actual = (yield locator.inputValue()).trim();
            (0, test_1.expect)(actual).toBe(String(expected));
        });
    }
    open(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.goto(url);
        });
    }
    getTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.title();
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.pause();
        });
    }
    getUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.page.url();
        });
    }
    waitAndHardClick(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.$eval(selector, (element) => element.click());
        });
    }
    safeScroll(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page.isClosed()) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                }
                catch (err) {
                    console.warn('⚠️ Could not scroll, page might be closing:', err);
                }
            }
            else {
                console.warn('⚠️ Page is closed, skipping scroll');
            }
        });
    }
    keyPress(selectorOrKey, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key) {
                // Selector or locator provided
                if (typeof selectorOrKey === 'string') {
                    yield this.page.press(selectorOrKey, key);
                }
                else {
                    yield selectorOrKey.press(key);
                }
            }
            else {
                // Only key provided → global key press
                yield this.page.keyboard.press(selectorOrKey);
            }
        });
    }
    verifyCost(locator_1, expected_1) {
        return __awaiter(this, arguments, void 0, function* (locator, expected, precision = 4) {
            yield this.safeScroll(locator);
            const uiValueText = yield locator.textContent();
            const uiValue = parseFloat(uiValueText || '0');
            // Allow small differences (use toFixed + parseFloat)
            const diff = Math.abs(expected - uiValue);
            const tolerance = Math.pow(10, -precision);
            console.info(`🔍 Verifying ${locator.toString()} | expected: ${expected}, uiValue: ${uiValue}, tolerance: ${tolerance}`);
            (0, test_1.expect)(diff).toBeLessThanOrEqual(tolerance);
        });
    }
    takeScreenShot() {
        return __awaiter(this, arguments, void 0, function* (fileName = 'MyScreenShot.png') {
            const screenshot = yield this.page.screenshot();
            return (0, test_1.expect)(screenshot).toMatchSnapshot(fileName);
        });
    }
    verifyElementText(selector, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const textValue = yield this.page.textContent(selector);
            return (0, test_1.expect)(textValue === null || textValue === void 0 ? void 0 : textValue.trim()).toBe(text);
        });
    }
    verifyElementContainsText(selector, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const locator = this.page.locator(selector);
            return yield (0, test_1.expect)(locator).toContainText(text);
        });
    }
    verifyJSElementValue(selector, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const textValue = yield this.page.$eval(selector, (el) => el.value);
            return (0, test_1.expect)(textValue === null || textValue === void 0 ? void 0 : textValue.trim()).toBe(text);
        });
    }
    selectValue(element, value) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔽 Selecting value "${value}" from dropdown`);
            yield element.click({ force: true });
            // Try ARIA role first
            let option = this.page.getByRole('option', { name: value });
            try {
                yield option.waitFor({ state: 'visible', timeout: 10000 });
                yield option.click();
            }
            catch (_a) {
                // Fallback: locate by text
                logger.warn(`⚠️ ARIA role not found, retrying with text locator`);
                option = this.page.locator(`text=${value}`);
                yield option.waitFor({ state: 'visible', timeout: 10000 });
                yield option.click();
            }
            logger.info(`✅ Selected "${value}" successfully`);
        });
    }
    selectByIndex(dropdownSelector, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const dropdown = this.page.locator(dropdownSelector);
            const tag = yield dropdown.evaluate(el => el.tagName.toLowerCase());
            if (tag === 'select') {
                yield dropdown.selectOption({ index });
            }
            else {
                yield dropdown.click({ force: true });
                const options = this.page.locator('[role="option"]');
                yield options.nth(index).click();
            }
        });
    }
    getAllOptions(dropdown) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = typeof dropdown === 'string' ? this.page.locator(dropdown) : dropdown;
            const tag = yield element.evaluate(el => el.tagName.toLowerCase());
            if (tag === 'select') {
                return element.evaluate(el => {
                    const select = el;
                    return Array.from(select.options).map(opt => opt.text);
                });
            }
            else {
                yield element.click({ force: true });
                const options = this.page.locator('[role="option"]');
                const count = yield options.count();
                const texts = [];
                for (let i = 0; i < count; i++) {
                    texts.push((yield options.nth(i).innerText()).trim());
                }
                yield this.page.keyboard.press('Escape');
                return texts;
            }
        });
    }
    selectMultiple(dropdownSelector, values) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.locator(dropdownSelector).click({ force: true });
            for (const value of values) {
                const option = this.page.getByRole('option', { name: value });
                yield option.waitFor({ state: 'visible', timeout: 5000 });
                yield option.click();
            }
            yield this.page.keyboard.press('Escape');
        });
    }
    selectAllDropdownOptions(dropdown) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.getAllOptions(dropdown);
            for (const option of options) {
                console.log('Selecting:', option);
                yield this.selectValue(dropdown, option);
                const selectedText = yield dropdown
                    .inputValue()
                    .catch(() => dropdown.textContent());
                console.log('Selected value:', selectedText === null || selectedText === void 0 ? void 0 : selectedText.trim());
                (0, test_1.expect)(selectedText === null || selectedText === void 0 ? void 0 : selectedText.trim()).toBe(option);
                yield this.page.waitForTimeout(500);
            }
        });
    }
    expectFieldValue(locator, expected) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagName = yield locator.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
                // Assert selected option LABEL (Angular-safe)
                const selectedText = yield locator.evaluate((el) => { var _a, _b; return (_b = (_a = el.options[el.selectedIndex]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim(); });
                (0, test_1.expect)(selectedText).toBe(String(expected));
            }
            else {
                // Input / textarea
                const actual = (yield locator.inputValue()).trim();
                (0, test_1.expect)(actual).toBe(String(expected));
            }
        });
    }
    getFieldDisplayValue(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagName = yield locator.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
                return ((yield locator.evaluate((el) => { var _a, _b; return (_b = (_a = el.options[el.selectedIndex]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim(); })) || '');
            }
            return (yield locator.inputValue()).trim();
        });
    }
    verifyElementAttribute(selector, attribute, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const attrValue = yield this.page.getAttribute(selector, attribute);
            return (0, test_1.expect)(attrValue === null || attrValue === void 0 ? void 0 : attrValue.trim()).toBe(value);
        });
    }
    getFirstElementFromTheList(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = this.page.locator(selector);
            return yield rows.first().textContent();
        });
    }
    getLastElementFromTheList(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = this.page.locator(selector);
            return yield rows.last().textContent();
        });
    }
    clickAllElements(selector_1) {
        return __awaiter(this, arguments, void 0, function* (selector, count = 2) {
            const rows = this.page.locator(selector);
            for (let i = 0; i < count; i++) {
                yield rows.nth(i).click();
            }
        });
    }
    isElementNotVisible(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = this.page.locator(selector);
            yield (0, test_1.expect)(element).toBeHidden();
        });
    }
    isElementEnabled(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = this.page.locator(selector);
            const isEnabled = yield element.isEnabled();
            (0, test_1.expect)(isEnabled).toBeTruthy();
        });
    }
    isElementChecked(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = this.page.locator(selector);
            const isChecked = yield element.isChecked();
            (0, test_1.expect)(isChecked).toBeTruthy();
        });
    }
    dragAndDropFiles(selector, filePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            // ✅ Step 1: Validate that all files exist
            for (const filePath of filePaths) {
                if (!node_fs_1.default.existsSync(filePath)) {
                    throw new Error(`❌ File not found: ${filePath}`);
                }
                console.log(`✅ File exists: ${filePath}`);
            }
            // ✅ Step 2: Resolve locator to a valid CSS selector string
            const selectorStr = typeof selector === 'string'
                ? selector
                : yield selector.evaluate(el => el.id ? `#${el.id}` : el.tagName.toLowerCase());
            // ✅ Step 3: Convert file buffers to transferable data
            const filesData = filePaths.map(filePath => {
                const buffer = node_fs_1.default.readFileSync(filePath);
                return {
                    name: node_path_1.default.basename(filePath),
                    mimeType: 'application/octet-stream',
                    buffer: Array.from(buffer)
                };
            });
            // ✅ Step 4: Simulate drag-and-drop in browser context
            yield this.page.evaluate((_a) => __awaiter(this, [_a], void 0, function* ({ selectorStr, filesData }) {
                const dropZone = document.querySelector(selectorStr);
                if (!dropZone)
                    throw new Error(`Drop target not found: ${selectorStr}`);
                const dt = new DataTransfer();
                for (const file of filesData) {
                    const bytes = new Uint8Array(file.buffer);
                    const blob = new Blob([bytes], { type: file.mimeType });
                    const f = new File([blob], file.name, { type: file.mimeType });
                    dt.items.add(f);
                }
                // Helper to trigger proper drag-drop events
                const triggerEvent = (type) => {
                    const event = new DragEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: dt
                    });
                    dropZone.dispatchEvent(event);
                };
                triggerEvent('dragenter');
                triggerEvent('dragover');
                triggerEvent('drop');
            }), { selectorStr, filesData });
            console.log('🎯 Drag-and-drop simulation complete');
        });
    }
    FillRevNo(costingNotesText, revisionLocator) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Match common patterns like "REV:C", "Revision - 02", "Rev 1A", etc.
                const match = costingNotesText.match(/rev(?:ision)?[:\s-]*([A-Za-z0-9]+)/i);
                const revisionValue = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim();
                if (revisionValue) {
                    logger.info(`🧩 Extracted Revision Number from Costing Notes: ${revisionValue}`);
                    yield this.waitAndFill(revisionLocator, revisionValue);
                    logger.info(`✅ Filled Revision Number field with: ${revisionValue}`);
                }
                else {
                    logger.warn('⚠️ Revision number not found in costing notes');
                }
            }
            catch (error) {
                logger.error(`❌ Error while extracting or filling revision number: ${error}`);
                throw error;
            }
        });
    }
    extractAndFillDrawingNumber(costingNotesText, drawingLocator) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Match "Part Number: 1023729" or "Part No 1023729"
                const match = costingNotesText.match(/part\s*number[:\s-]*([A-Za-z0-9-]+)/i);
                const drawingValue = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim();
                if (drawingValue) {
                    logger.info(`🧾 Extracted Drawing Number from Costing Notes: ${drawingValue}`);
                    yield this.waitAndFill(drawingLocator, drawingValue);
                    (0, test_1.expect)(drawingValue).not.toBe('');
                }
                else {
                    logger.warn('⚠️ Drawing Number not found in Costing Notes');
                }
            }
            catch (error) {
                logger.error(`❌ Error while extracting or filling Drawing Number: ${error}`);
                throw error;
            }
        });
    }
    safeExecute(methodName, action) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield action();
            }
            catch (error) {
                logger.warn(`⚠️ Skipping "${methodName}" due to error: ${error.message}`);
            }
        });
    }
    ensureVisible(locator, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield locator.scrollIntoViewIfNeeded();
                yield locator.waitFor({ state: 'visible', timeout: 10000 });
            }
            catch (_a) {
                throw new Error(`⚠️ ${name} field not visible on screen.`);
            }
        });
    }
    verifyDropdownOptions(dropdown, label, expectedOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.info(`🔹 Validating dropdown: ${label}`);
                // --- 🧹 Ensure any previously open dropdown is closed ---
                yield this.page.keyboard.press('Escape').catch(() => { });
                yield this.page.waitForTimeout(300);
                yield dropdown.scrollIntoViewIfNeeded();
                yield (0, test_1.expect)(dropdown).toBeVisible({ timeout: 10000 });
                // --- Skip if disabled or readonly ---
                if ((yield dropdown.isDisabled()) ||
                    (yield dropdown.getAttribute('readonly'))) {
                    logger.warn(`⚠️ ${label} dropdown is disabled or readonly. Skipping validation.`);
                    return;
                }
                // --- Open current dropdown ---
                yield dropdown.click({ force: true });
                yield this.page.waitForTimeout(400);
                const optionsLocator = this.page.locator('mat-option .mdc-list-item__primary-text');
                yield optionsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
                const actualOptions = yield optionsLocator.allInnerTexts();
                (0, test_1.expect)(actualOptions.length).toBeGreaterThan(0);
                logger.info(`📦 Found ${actualOptions.length} options for ${label}: ${actualOptions.join(', ')}`);
                // --- Verify expected options exist ---
                const foundMatch = expectedOptions.some(o => actualOptions.some(a => a.trim().toLowerCase() === o.toLowerCase()));
                (0, test_1.expect)(foundMatch).toBeTruthy();
                // --- Select first option ---
                yield optionsLocator.first().click({ force: true });
                yield this.page.waitForTimeout(300);
                // --- ✅ Close dropdown if still open ---
                yield this.page.keyboard.press('Escape').catch(() => { });
                yield this.page.waitForTimeout(300);
                logger.info(`✅ ${label} dropdown validation completed successfully.`);
            }
            catch (err) {
                logger.error(`❌ ${label} dropdown validation failed: ${err.message}`);
                // Always close dropdown on failure to avoid cascading issues
                yield this.page.keyboard.press('Escape').catch(() => { });
                yield this.page.waitForTimeout(300);
                throw err;
            }
        });
    }
    searchAndSelectRandom(page, searchBox, tableSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fill search box
            if (typeof searchBox === 'string') {
                yield page.fill(searchBox, 'your search text');
            }
            else {
                yield searchBox.fill('your search text');
            }
            yield page.keyboard.press('Enter');
            // Wait for table to update
            yield page.waitForTimeout(1000);
            // Get all rows
            const rows = yield page.locator(`${tableSelector} tr`).all();
            if (rows.length === 0)
                throw new Error('No rows found');
            // Pick a random row
            const randomIndex = Math.floor(Math.random() * rows.length);
            const randomRow = rows[randomIndex];
            // Pick 3rd column
            const cell = randomRow.locator('td:nth-child(3)');
            yield cell.click();
            const cellText = yield cell.textContent();
            console.log(`Selected cell text: ${cellText}`);
        });
    }
    selectRandomRow(page) {
        return __awaiter(this, void 0, void 0, function* () {
            // get all rows (many)
            const rows = page.locator('tbody.p-datatable-tbody tr[data-p-selectable-row="true"]');
            // Wait for at least ONE row
            yield rows.first().waitFor({ state: 'visible', timeout: 5000 });
            const count = yield rows.count();
            logger.info(`📌 Total rows found: ${count}`);
            const indexes = [];
            for (let i = 0; i < count; i++) {
                if (yield rows.nth(i).isVisible()) {
                    indexes.push(i);
                }
            }
            if (indexes.length === 0) {
                throw new Error('❌ No visible rows found in the table');
            }
            const randomIndex = indexes[Math.floor(Math.random() * indexes.length)];
            const randomRow = rows.nth(randomIndex);
            yield randomRow.scrollIntoViewIfNeeded();
            yield page.waitForTimeout(150);
            yield randomRow.click({ force: true });
            logger.info('✔ Random row selected successfully');
            console.log(`✅ Clicked random row #${randomIndex + 1}`);
        });
    }
    // 🔹 Generic function to get any model property by name
    getModelProperty(label) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueLocator = this.page.locator(`.properties-panel__property:has(.properties-panel__property-name:text("${label}"))
       .properties-panel__property-value`);
            yield (0, test_1.expect)(valueLocator).toBeVisible();
            const value = Number(yield valueLocator.textContent());
            if (isNaN(value))
                throw new Error(`Could not read number for: ${label}`);
            return value;
        });
    }
    getPropertyHeading(name) {
        return this.page.locator(`//h6[contains(@class,'properties-panel__group-title')]//*[normalize-space(text())='${name}']`);
    }
    selectByTrimmedLabel(select, label) {
        return __awaiter(this, void 0, void 0, function* () {
            yield test_1.expect.poll(() => select.locator('option').count()).toBeGreaterThan(1);
            const option = select
                .locator('option')
                .filter({ hasText: new RegExp(label.trim(), 'i') })
                .first();
            const value = yield option.getAttribute('value');
            if (!value) {
                throw new Error(`No value found for option "${label}"`);
            }
            yield select.selectOption({ value });
        });
    }
    validateHeading(expected) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const heading = this.getPropertyHeading(expected);
            yield (0, test_1.expect)(heading).toBeVisible({ timeout: 2000 });
            const actual = (_b = (_a = (yield heading.textContent())) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
            (0, test_1.expect)(actual).toBe(expected);
            console.log(`✔ Heading validated: ${actual}`);
        });
    }
    static getCleanText(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = (yield locator.innerText().catch(() => '')) ||
                (yield locator.textContent().catch(() => ''));
            return (text || '')
                .trim()
                .replace(/\n/g, ' ')
                .replace(/\s{2,}/g, ' ');
        });
    }
    static expectTextFromLocatorInTarget(sourceLocator_1, targetLocator_1) {
        return __awaiter(this, arguments, void 0, function* (sourceLocator, targetLocator, label = 'Value', soft = false) {
            const expectedText = yield this.getCleanText(sourceLocator);
            if (!expectedText) {
                logger.warn(`⚠️ ${label} not found in source locator.`);
                return;
            }
            yield targetLocator.waitFor({ state: 'visible', timeout: 15000 });
            const targetText = (yield targetLocator.inputValue().catch(() => '')) ||
                (yield targetLocator.innerText().catch(() => ''));
            const cleanedTarget = targetText.replace(/\s+/g, ' ').trim();
            logger.info(`🔍 Validating ${label}: "${expectedText}"`);
            logger.info(`📘 Target Text: ${cleanedTarget}`);
            if (soft) {
                test_1.expect
                    .soft(cleanedTarget.toLowerCase())
                    .toContain(expectedText.toLowerCase());
            }
            else {
                (0, test_1.expect)(cleanedTarget.toLowerCase()).toContain(expectedText.toLowerCase());
            }
            logger.info(`✅ ${label} validation successful.`);
        });
    }
    getSelectedText(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            return locator.evaluate((el) => { var _a, _b; return ((_b = (_a = el.options[el.selectedIndex]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.trim()) || ''; });
        });
    }
    normalizeText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            return text
                .toLowerCase()
                .replace(/&/g, 'and')
                .replace(/\//g, ' ')
                .replace(/[-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        });
    }
    selectFromAutocomplete(dropdown, optionsLocator, textToSelect, label) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure valid state
                yield dropdown.scrollIntoViewIfNeeded();
                yield dropdown.waitFor({ state: 'visible', timeout: 5000 });
                if ((yield dropdown.isDisabled()) ||
                    (yield dropdown.getAttribute('readonly'))) {
                    logger.warn(`⚠️ ${label} dropdown is disabled. Skipping.`);
                    return;
                }
                // Open the dropdown
                yield dropdown.click({ force: true });
                yield this.wait(500); // Wait for animation
                // Use the provided options locator to find the option
                try {
                    yield optionsLocator
                        .first()
                        .waitFor({ state: 'visible', timeout: 5000 });
                }
                catch (e) {
                    // If no options, maybe we need to type?
                    // But let's assume click was enough for now or try to type if it's an input
                    const isInput = yield dropdown.evaluate(el => el.tagName.toLowerCase() === 'input');
                    if (isInput) {
                        yield dropdown.fill(textToSelect);
                        yield this.wait(500);
                        yield optionsLocator
                            .first()
                            .waitFor({ state: 'visible', timeout: 5000 });
                    }
                    else {
                        throw new Error(`Options did not appear for ${label}`);
                    }
                }
                // Find match
                const targetOption = optionsLocator
                    .filter({ hasText: textToSelect })
                    .first();
                if (yield targetOption.isVisible()) {
                    yield targetOption.click();
                }
                else {
                    // Fallback: iterate
                    const count = yield optionsLocator.count();
                    let found = false;
                    for (let i = 0; i < count; i++) {
                        const optText = yield optionsLocator.nth(i).innerText();
                        if (optText.includes(textToSelect)) {
                            yield optionsLocator.nth(i).click();
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        // One last try: if type-able, maybe we typed and it's the first one?
                        // But better to fail than select wrong thing
                        throw new Error(`Option "${textToSelect}" not found in ${label}`);
                    }
                }
                // Close if needed
                yield this.page.keyboard.press('Escape').catch(() => { });
                const selectedValue = yield dropdown
                    .inputValue()
                    .catch(() => dropdown.textContent());
                logger.info(`✅ Selected ${label}: "${textToSelect}" (Verified: ${selectedValue})`);
            }
            catch (error) {
                logger.error(`❌ ${label} selection failed: ${error.message}`);
                // Close dropdown to avoid blocking
                yield this.page.keyboard.press('Escape').catch(() => { });
                throw error;
            }
        });
    }
    expandIfCollapsed1(panel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield panel.isVisible()))
                return;
            if (yield this.isPanelCollapsed(panel)) {
                yield panel.scrollIntoViewIfNeeded();
                yield panel.click({ force: true });
            }
        });
    }
    expandWeldCollapsed(toggle) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Scroll the icon into view and make sure it's visible
                yield toggle.scrollIntoViewIfNeeded();
                yield toggle.waitFor({ state: 'visible', timeout: 5000 });
                // aria-expanded is missing on this element, so we skip checking it
                logger.info('▶️ Clicking mat-icon to expand section...');
                yield toggle.click({ force: true });
                // Wait for a child element inside the expansion panel (like wireDia input)
                const panelChild = toggle
                    .locator('xpath=ancestor::mat-expansion-panel//input')
                    .first();
                yield panelChild.waitFor({ state: 'visible', timeout: 2000 });
                logger.info('✔ Section expanded successfully');
            }
            catch (err) {
                logger.warn(`⚠️ Could not expand section reliably: ${err}`);
            }
        });
    }
    expandIfCollapsed(toggle) {
        return __awaiter(this, void 0, void 0, function* () {
            yield toggle.scrollIntoViewIfNeeded();
            yield toggle.waitFor({ state: 'visible' });
            let expanded = yield toggle.getAttribute('aria-expanded');
            logger.info(`🔍 aria-expanded: ${expanded}`);
            if (expanded === null) {
                logger.warn(`⚠️ Element doesn't have aria-expanded attribute. Trying to click to expand.`);
                yield toggle.click({ force: true });
                yield this.page.waitForTimeout(500);
                return;
            }
            if (expanded !== 'true') {
                logger.info('▶️ Expanding section...');
                yield toggle.click({ force: true }); // 👈 force click
                yield this.page.waitForTimeout(500); // allow animation
            }
        });
    }
    waitForStableNumber(locator_1, fieldName_1) {
        return __awaiter(this, arguments, void 0, function* (locator, fieldName, timeout = 12000, interval = 400) {
            const start = Date.now();
            let lastValue = -1;
            let stableCount = 0;
            while (Date.now() - start < timeout) {
                const value = yield this.getInputValueAsNumber(locator);
                logger.info(`⏳ Polling ${fieldName}: ${value}`);
                if (value > 0 && value === lastValue) {
                    stableCount++;
                    if (stableCount >= 2) {
                        logger.info(`✅ ${fieldName} stabilized at ${value}`);
                        return value;
                    }
                }
                else {
                    stableCount = 0;
                }
                lastValue = value;
                yield this.wait(interval);
            }
            throw new Error(`❌ ${fieldName} did not stabilize within ${timeout}ms`);
        });
    }
    pollStableNumberGreaterThan(selector_1, fieldName_1) {
        return __awaiter(this, arguments, void 0, function* (selector, fieldName, timeout = 10000, interval = 500) {
            const start = Date.now();
            let lastValue = -1;
            let stableCount = 0;
            while (Date.now() - start < timeout) {
                const value = yield this.getInputValueAsNumber(selector);
                logger.info(`⏳ Polling ${fieldName}: ${value}`);
                if (value > 0 && value === lastValue) {
                    stableCount++;
                    if (stableCount >= 2)
                        return value; // stable twice
                }
                else {
                    stableCount = 0;
                }
                lastValue = value;
                yield this.wait(interval);
            }
            throw new Error(`${fieldName} did not stabilize within ${timeout}ms`);
        });
    }
    readNumberSafe(selector_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (selector, name, timeout = 8000, retries = 1) {
            const safeSelector = selector.first(); // ✅ force single element
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    // ✅ Wait until element is attached + visible
                    yield safeSelector.waitFor({
                        state: 'visible',
                        timeout
                    });
                    const value = yield this.pollStableNumberGreaterThan(safeSelector, name, timeout);
                    if (value === 0) {
                        logger.warn(`⚠️ ${name} is 0 on attempt ${attempt}`);
                    }
                    return value;
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read ${name}: ${err}`);
                    if (attempt === retries)
                        return 0;
                    yield this.wait(500);
                }
            }
            return 0;
        });
    }
    expandPanel(panel_1, header_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (panel, header, label, timeout = 10000) {
            try {
                logger.info(`🔍 Checking ${label} panel...`);
                yield panel.waitFor({ state: 'attached', timeout });
                yield header.scrollIntoViewIfNeeded();
                const isExpanded = () => __awaiter(this, void 0, void 0, function* () {
                    const attr = yield panel.getAttribute('aria-expanded');
                    return attr === 'true';
                });
                if (yield isExpanded()) {
                    logger.info(`✅ ${label} already expanded`);
                    return;
                }
                logger.info(`📂 Expanding ${label}...`);
                yield header.click({ force: true });
                yield this.page.waitForTimeout(400);
                // Retry once if needed
                if (!(yield isExpanded())) {
                    logger.warn(`♻️ ${label} not expanded yet — retrying...`);
                    yield header.click({ force: true });
                    yield this.page.waitForTimeout(600);
                }
                if (yield isExpanded()) {
                    logger.info(`✅ ${label} expanded successfully`);
                }
                else {
                    throw new Error(`${label} did not expand after retries`);
                }
            }
            catch (error) {
                logger.error(`❌ ${label} expansion failed: ${error.message}`);
                throw error;
            }
        });
    }
    openMatSelect(trigger, label) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`📂 Opening dropdown: ${label}`);
            yield trigger.waitFor({ state: 'visible', timeout: 10000 });
            yield trigger.scrollIntoViewIfNeeded();
            yield trigger.click({ force: true });
            yield this.page.waitForTimeout(500); // ⏳ small wait for overlay to open
            // Try to find any visible mat-option (standard or MDC)
            const options = this.page.locator('mat-option, mat-mdc-option, [role="option"]');
            try {
                yield options.first().waitFor({ state: 'visible', timeout: 10000 });
                logger.info(`✅ ${label} dropdown opened`);
            }
            catch (err) {
                logger.warn(`⚠️ Dropdown options didn't appear for ${label} via overlay search. Attempting retry click...`);
                yield trigger.click({ force: true });
                yield options.first().waitFor({ state: 'visible', timeout: 5000 });
            }
        });
    }
    safeGetNumber(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, fallback = 0) {
            try {
                if (!(yield locator.isVisible()))
                    return fallback;
                const value = yield this.getInputValueAsNumber(locator);
                return Number.isFinite(value) ? value : fallback;
            }
            catch (_a) {
                return fallback;
            }
        });
    }
    getCost(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = (yield locator.innerText()).trim();
            const value = Number(text);
            if (Number.isNaN(value)) {
                throw new Error(`Invalid numeric value: "${text}"`);
            }
            return value;
        });
    }
    sumLocatorValues(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield locator.count();
            let total = 0;
            for (let i = 0; i < count; i++) {
                const text = (yield locator.nth(i).innerText()).trim();
                const value = Number(text);
                if (Number.isNaN(value)) {
                    throw new Error(`Invalid number: "${text}"`);
                }
                total += value;
            }
            return Number(total.toFixed(4));
        });
    }
    getCostByType(page_1, type_1) {
        return __awaiter(this, arguments, void 0, function* (page, type, index = 0) {
            const cells = page.locator("//table[@aria-describedby='packagingTable']" +
                `//tr[.//td[normalize-space()='${type}']]` +
                "//td[contains(@class,'cdk-column-cost')]");
            const cell = cells.nth(index);
            yield cell.waitFor();
            const rawText = (yield cell.innerText()).trim();
            const match = rawText.match(/-?[\d,.]+/);
            if (!match) {
                throw new Error(`❌ Unable to extract number from text: "${rawText}"`);
            }
            return Number(match[0].replace(/,/g, ''));
        });
    }
    waitForValueChange(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 15000) {
            const initialValue = yield locator.inputValue();
            yield test_1.expect
                .poll(() => __awaiter(this, void 0, void 0, function* () { return yield locator.inputValue(); }), { timeout })
                .not.toBe(initialValue);
        });
    }
    safeGetInputValue(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, defaultValue = 0, label) {
            var _a;
            try {
                if ((yield locator.count()) === 0) {
                    logger.warn(`⚠️ ${label || 'Field'} not present → default ${defaultValue}`);
                    return defaultValue;
                }
                const first = locator.first();
                if (!(yield first.isVisible({ timeout: 1500 }))) {
                    logger.warn(`⚠️ ${label || 'Field'} hidden → default ${defaultValue}`);
                    return defaultValue;
                }
                return (_a = (yield this.getInputValueAsNumber(first))) !== null && _a !== void 0 ? _a : defaultValue;
            }
            catch (err) {
                logger.warn(`⚠️ ${label || 'Field'} read failed → default ${defaultValue}`);
                return defaultValue;
            }
        });
    }
    isDirty(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield locator.isVisible()))
                    return false;
                const bg = yield locator.evaluate(el => window.getComputedStyle(el).backgroundColor);
                return bg.includes('255, 165, 0');
            }
            catch (_a) {
                return false;
            }
        });
    }
    getInputValueSafe(locator, label) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.scrollIntoViewIfNeeded();
            yield (0, test_1.expect)(locator).toBeVisible({ timeout: 10000 });
            const val = yield locator.inputValue().catch(() => '0');
            const num = Number(val || '0');
            logger.info(`🔹 ${label} value: ${num}`);
            return num;
        });
    }
    expandWeldIfVisibleAlternative(weldHeader, label, expandedContent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield weldHeader.isVisible().catch(() => false))) {
                logger.warn(`⚠️ ${label} not visible — skipping expansion`);
                return;
            }
            logger.info(`🔽 Ensuring ${label} is expanded`);
            const expandedAttr = yield weldHeader.getAttribute('aria-expanded');
            if (expandedAttr === 'true') {
                logger.info(`✅ ${label} already expanded`);
                return;
            }
            yield weldHeader.scrollIntoViewIfNeeded();
            yield weldHeader.click({ force: true });
            try {
                yield Promise.race([
                    expandedContent
                        ? expandedContent.waitFor({ state: 'visible', timeout: 5000 })
                        : Promise.resolve(),
                    test_1.expect
                        .poll(() => __awaiter(this, void 0, void 0, function* () { return yield weldHeader.getAttribute('aria-expanded'); }), {
                        timeout: 5000
                    })
                        .toBe('true')
                ]);
                logger.info(`✅ ${label} expanded successfully`);
            }
            catch (_a) {
                logger.warn(`⚠️ ${label} expansion state unclear — continuing test (non-blocking)`);
            }
        });
    }
    getSubProcessOptionValue(locator_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (locator, name, timeout = 15000, retries = 3) {
            var _a;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                    yield locator.waitFor({ state: 'visible', timeout });
                    const option = locator.locator('option:checked');
                    yield option.waitFor({ state: 'visible', timeout });
                    const value = yield option.textContent();
                    if (value === null) {
                        logger.warn(`⚠️ ${name} returned null textContent`);
                    }
                    return (_a = value === null || value === void 0 ? void 0 : value.trim()) !== null && _a !== void 0 ? _a : null;
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read ${name}: ${err}`);
                    if (attempt === retries) {
                        logger.error(`❌ Failed to read ${name} after ${retries} attempts`);
                        return null;
                    }
                    yield this.page.waitForTimeout(500); // small delay before retry
                }
            }
            return null;
        });
    }
    getVisibleInputNumber(locator_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (locator, name, retries = 3) {
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                    yield locator.waitFor({ state: 'visible', timeout: 5000 });
                    const valueRaw = yield locator.inputValue();
                    const value = Number(valueRaw);
                    if (Number.isFinite(value))
                        return value;
                    throw new Error(`Invalid number: ${valueRaw}`);
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read input ${name !== null && name !== void 0 ? name : 'unknown'}: ${err}`);
                    if (attempt === retries) {
                        logger.error(`❌ Failed to read numeric input ${name !== null && name !== void 0 ? name : 'unknown'} after ${retries} attempts`);
                        return 0;
                    }
                    yield this.page.waitForTimeout(500);
                }
            }
            return 0;
        });
    }
    retryLocatorNumber(locator_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (locator, label, retries = 3, delayMs = 500) {
            var _a, _b;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                    const text = (_b = (_a = (yield locator.textContent())) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '0';
                    const value = Number(text.replace(/[^\d.-]/g, ''));
                    if (!Number.isNaN(value))
                        return value;
                    throw new Error(`Invalid number "${text}"`);
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read ${label}: ${err}`);
                    if (attempt === retries)
                        throw err;
                    yield this.page.waitForTimeout(delayMs);
                }
            }
            return 0;
        });
    }
    // Utility retry for text locators
    retryLocatorText(locator_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (locator, label, retries = 3, delayMs = 500) {
            var _a, _b;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                    return (_b = (_a = (yield locator.textContent())) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read ${label}: ${err}`);
                    if (attempt === retries)
                        throw err;
                    yield this.page.waitForTimeout(delayMs);
                }
            }
            return '';
        });
    }
    clickWithRetry(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, retries = 3, delayMs = 500) {
            for (let i = 0; i < retries; i++) {
                try {
                    if (yield locator.isVisible({ timeout: 3000 })) {
                        yield locator.scrollIntoViewIfNeeded();
                        yield locator.click({ force: true });
                        return true;
                    }
                }
                catch (err) {
                    console.warn(`Attempt ${i + 1} failed: ${err}`);
                }
                yield this.page.waitForTimeout(delayMs);
            }
            throw new Error('Failed to click project icon after retries');
        });
    }
}
exports.BasePage = BasePage;
// ========================== Verification Helper ==========================
class VerificationHelper {
    static verifyNumeric(value_1, expected_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (value, expected, label, tolerancePercent = 2, unit = '') {
            const diffPercent = Math.abs((value - expected) / expected) * 100;
            test_1.expect
                .soft(diffPercent, `${label} difference ${diffPercent.toFixed(2)}% exceeds tolerance`)
                .toBeLessThanOrEqual(tolerancePercent);
        });
    }
    static verifyNumericCloseTo(value_1, expected_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (value, expected, label, precision = 2) {
            logger.info(`   ✓ ${label}: ${value.toFixed(precision)} (Expected: ${expected.toFixed(precision)})`);
            test_1.expect.soft(value).toBeCloseTo(expected, precision);
        });
    }
    static verifyOptional(value_1, expected_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (value, expected, label, precision = 2) {
            if (value === undefined || value === null) {
                logger.warn(`   ⚠️ ${label} is undefined, skipping assertion`);
                return;
            }
            yield this.verifyNumeric(value, expected, label, precision);
        });
    }
    static verifySafe(getValue_1, expected_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (getValue, expected, label, precision = 2, fallback = 0) {
            try {
                const value = yield getValue();
                yield this.verifyNumeric(value !== null && value !== void 0 ? value : fallback, expected, label, precision);
            }
            catch (error) {
                logger.warn(`⚠️ Failed to verify ${label}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    static verifyDropdown(actual, expected, label) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`   ✓ ${label}: ${actual} (Expected: ${expected})`);
            if (expected) {
                test_1.expect.soft(actual).toBe(expected);
            }
        });
    }
    static getVisibleInputNumber(locator_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (locator, name, retries = 3) {
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    yield locator.scrollIntoViewIfNeeded();
                    yield locator.waitFor({ state: 'visible', timeout: 5000 });
                    const valueRaw = yield locator.inputValue();
                    const value = Number(valueRaw.replace(/,/g, ''));
                    if (Number.isFinite(value))
                        return value;
                    throw new Error(`Invalid number: ${valueRaw}`);
                }
                catch (err) {
                    logger.warn(`⚠️ Attempt ${attempt} failed to read input ${name !== null && name !== void 0 ? name : 'unknown'}: ${err}`);
                    if (attempt === retries)
                        return 0;
                    const p = locator.page();
                    if (p)
                        yield p.waitForTimeout(500);
                }
            }
            return 0;
        });
    }
    static verifyUIValue(page, locator, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { expectedValue, label, precision = 2, tolerance } = config;
            yield locator.scrollIntoViewIfNeeded();
            yield page.waitForTimeout(200);
            if (!(yield locator.isVisible())) {
                logger.info(`   ⊘ ${label} not visible, skipping verification`);
                return;
            }
            if (tolerance !== undefined) {
                yield this.verifySafe(() => this.getVisibleInputNumber(locator, label), expectedValue, label, tolerance);
            }
            else {
                yield this.verifySafe(() => this.getVisibleInputNumber(locator, label), expectedValue, label, precision);
            }
        });
    }
    static safeReadNumber(locator_1, label_1, weldIndex_1) {
        return __awaiter(this, arguments, void 0, function* (locator, label, weldIndex, timeout = 8000) {
            try {
                yield locator.waitFor({ state: 'visible', timeout });
                yield locator.scrollIntoViewIfNeeded();
                const raw = yield locator.inputValue({ timeout });
                const value = Number(raw.replace(/,/g, ''));
                if (!Number.isFinite(value))
                    throw new Error(`Invalid numeric value: "${raw}"`);
                logger.info(`🔎 [Weld ${weldIndex}] ${label} = ${value}`);
                return value;
            }
            catch (err) {
                logger.error(`❌ [Weld ${weldIndex}] Failed reading ${label}: ${err.message}`);
                throw err;
            }
        });
    }
    static expandWeldPanel(page, weldIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const weldName = `Weld ${weldIndex}`;
            const header = page.locator(`h6:has-text("${weldName}")`);
            logger.info(`🔽 Expanding ${weldName}`);
            yield header.waitFor({ state: 'visible', timeout: 15000 });
            yield header.scrollIntoViewIfNeeded();
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    yield header.click({ timeout: 4000 });
                    yield page.waitForTimeout(400);
                    logger.info(`✅ ${weldName} expanded (attempt ${attempt})`);
                    return;
                }
                catch (err) {
                    logger.warn(`⚠️ ${weldName} expand retry ${attempt}: ${err.message}`);
                }
            }
            throw new Error(`❌ ${weldName} failed to expand after retries`);
        });
    }
    static waitForLoadState(page_1) {
        return __awaiter(this, arguments, void 0, function* (page, state = 'networkidle', timeout = 30000, label = 'page') {
            try {
                logger.info(`⏳ Waiting for ${label} load state → ${state}`);
                yield page.waitForLoadState(state, { timeout });
                logger.info(`✅ ${label} reached load state → ${state}`);
            }
            catch (error) {
                logger.warn(`⚠️ Timeout waiting for ${label} load state → ${state}. Continuing execution.`);
            }
        });
    }
    isAttached(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 500) {
            try {
                yield locator.waitFor({ state: 'attached', timeout });
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    static safeFill(locator, value, fieldName, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { timeout = 5000, clearFirst = true, allowZero = true } = options !== null && options !== void 0 ? options : {};
            // ─────────────────────────────────────────────
            // 1️⃣ Validate input
            // ─────────────────────────────────────────────
            if (value === null || value === undefined || (!allowZero && value === 0)) {
                logger.warn(`⚠️ ${fieldName} value is invalid — skipping fill`);
                return 0;
            }
            try {
                // Defensive: ensure page isn't closed before interaction
                try {
                    const p = (_b = (_a = locator).page) === null || _b === void 0 ? void 0 : _b.call(_a);
                    if (p && typeof p.isClosed === 'function' && p.isClosed()) {
                        throw new Error('Target page is already closed - aborting fill');
                    }
                }
                catch (error_) {
                    // If we cannot obtain the page or it's closed, abort early with clear message
                    logger.error(`❌ Aborting safeFill for ${fieldName}: ${error_.message}`);
                    throw error_;
                }
                // ─────────────────────────────────────────────
                // 2️⃣ Ensure element is interactable
                // ─────────────────────────────────────────────
                yield locator.waitFor({ state: 'visible', timeout });
                yield locator.scrollIntoViewIfNeeded();
                // ─────────────────────────────────────────────
                // 3️⃣ Clear existing value safely
                // ─────────────────────────────────────────────
                if (clearFirst) {
                    yield locator.click({ clickCount: 3 });
                    yield locator.press('Backspace');
                }
                // ─────────────────────────────────────────────
                // 4️⃣ Fill value
                // ─────────────────────────────────────────────
                try {
                    yield locator.fill(String(value));
                }
                catch (error_) {
                    // Provide clearer logging if the page/context was closed
                    const msg = error_.message || '';
                    if (msg.includes('Target page, context or browser has been closed')) {
                        logger.error(`❌ Cannot fill ${fieldName}: page/context/browser closed`);
                    }
                    throw error_;
                }
                // ─────────────────────────────────────────────
                // 5️⃣ Blur to trigger recalculation (CRITICAL)
                // ─────────────────────────────────────────────
                yield locator.press('Tab');
                // ─────────────────────────────────────────────
                // 6️⃣ Read back & normalize
                // ─────────────────────────────────────────────
                const filledValue = Number(yield locator.inputValue());
                logger.info(`✅ Filled ${fieldName}: ${value} → UI=${filledValue}`);
                return Number.isFinite(filledValue) ? filledValue : 0;
            }
            catch (err) {
                logger.error(`❌ Failed to fill ${fieldName}: ${err.message}`);
                throw err;
            }
        });
    }
}
exports.VerificationHelper = VerificationHelper;
