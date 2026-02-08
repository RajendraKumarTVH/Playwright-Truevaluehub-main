"use strict";
/**
 * WebActions - Advanced Web Interaction Utilities
 * Provides specialized methods for complex UI interactions
 */
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
exports.WebActions = void 0;
const LoggerUtil_1 = __importDefault(require("./LoggerUtil"));
const logger = LoggerUtil_1.default;
class WebActions {
    constructor(page) {
        this.page = page;
    }
    // ==================== DROPDOWN ACTIONS ====================
    /**
     * Select from Material Angular mat-select dropdown
     */
    selectMatDropdown(dropdown, optionText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield dropdown.click();
            yield this.page.waitForTimeout(300);
            yield this.page.getByRole('option', { name: optionText }).click();
            yield this.page.waitForTimeout(200);
            logger.info(`✔ Selected: ${optionText}`);
        });
    }
    /**
     * Select from autocomplete with search
     */
    selectAutocomplete(input, searchText, optionText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield input.click();
            yield input.fill(searchText);
            yield this.page.waitForTimeout(500);
            yield this.page.getByRole('option', { name: optionText }).first().click();
            logger.info(`✔ Selected autocomplete: ${optionText}`);
        });
    }
    /**
     * Select from native HTML select
     */
    selectNativeDropdown(select, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield select.selectOption({ label: value });
            yield this.page.keyboard.press('Tab');
            logger.info(`✔ Selected native: ${value}`);
        });
    }
    // ==================== FORM ACTIONS ====================
    /**
     * Fill input field with validation
     */
    fillInput(locator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const stringValue = String(value);
            yield locator.waitFor({ state: 'visible' });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.fill('');
            yield locator.fill(stringValue);
            yield this.page.keyboard.press('Tab');
            yield this.page.waitForTimeout(200);
        });
    }
    /**
     * Clear and type with delay (for masked inputs)
     */
    clearAndType(locator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.click();
            yield this.page.keyboard.press('Control+A');
            yield this.page.keyboard.press('Delete');
            yield this.page.keyboard.type(value, { delay: 50 });
            yield this.page.keyboard.press('Tab');
        });
    }
    /**
     * Fill multiple fields from data object
     */
    fillForm(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const field of fields) {
                yield this.fillInput(field.locator, field.value);
            }
            logger.info(`✔ Filled ${fields.length} form fields`);
        });
    }
    // ==================== CHECKBOX & RADIO ====================
    /**
     * Set checkbox state
     */
    setCheckbox(checkbox, checked) {
        return __awaiter(this, void 0, void 0, function* () {
            const isChecked = yield checkbox.isChecked();
            if (isChecked !== checked) {
                yield checkbox.click();
            }
            logger.info(`✔ Checkbox set to: ${checked}`);
        });
    }
    /**
     * Select radio option
     */
    selectRadio(radio) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield radio.isChecked())) {
                yield radio.click();
            }
        });
    }
    // ==================== TABLE ACTIONS ====================
    /**
     * Get table cell value
     */
    getTableCellValue(table, row, column) {
        return __awaiter(this, void 0, void 0, function* () {
            const cell = table.locator(`tr:nth-child(${row}) td:nth-child(${column})`);
            return (yield cell.textContent()) || '';
        });
    }
    /**
     * Click table row by text content
     */
    clickTableRowByText(table, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = table.locator('tr', { hasText: text });
            yield row.click();
        });
    }
    /**
     * Get table row count
     */
    getTableRowCount(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield table.locator('tbody tr').count();
        });
    }
    // ==================== EXPANSION PANELS ====================
    /**
     * Expand accordion panel
     */
    expandPanel(panelHeader) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExpanded = yield panelHeader.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
                yield panelHeader.click();
                yield this.page.waitForTimeout(300);
            }
        });
    }
    /**
     * Collapse accordion panel
     */
    collapsePanel(panelHeader) {
        return __awaiter(this, void 0, void 0, function* () {
            const isExpanded = yield panelHeader.getAttribute('aria-expanded');
            if (isExpanded === 'true') {
                yield panelHeader.click();
                yield this.page.waitForTimeout(300);
            }
        });
    }
    // ==================== TAB ACTIONS ====================
    /**
     * Click tab by name
     */
    selectTab(tabName) {
        return __awaiter(this, void 0, void 0, function* () {
            const tab = this.page.getByRole('tab', { name: tabName });
            yield tab.click();
            yield this.page.waitForTimeout(300);
            logger.info(`✔ Selected tab: ${tabName}`);
        });
    }
    // ==================== DIALOG ACTIONS ====================
    /**
     * Handle confirmation dialog
     */
    acceptDialog() {
        return __awaiter(this, void 0, void 0, function* () {
            this.page.on('dialog', (dialog) => __awaiter(this, void 0, void 0, function* () {
                yield dialog.accept();
            }));
        });
    }
    /**
     * Handle and dismiss dialog
     */
    dismissDialog() {
        return __awaiter(this, void 0, void 0, function* () {
            this.page.on('dialog', (dialog) => __awaiter(this, void 0, void 0, function* () {
                yield dialog.dismiss();
            }));
        });
    }
    /**
     * Click button in modal
     */
    clickModalButton(buttonText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.getByRole('button', { name: buttonText }).click();
            yield this.page.waitForTimeout(500);
        });
    }
    // ==================== WAIT UTILITIES ====================
    /**
     * Wait for element with custom timeout
     */
    waitForElement(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 10000) {
            yield locator.waitFor({ state: 'visible', timeout });
        });
    }
    /**
     * Wait for loading spinner to disappear
     */
    waitForLoading() {
        return __awaiter(this, arguments, void 0, function* (spinnerSelector = '.loading-spinner') {
            const spinner = this.page.locator(spinnerSelector);
            yield spinner.waitFor({ state: 'hidden', timeout: 30000 });
        });
    }
    /**
     * Wait for toast/notification
     */
    waitForToast() {
        return __awaiter(this, arguments, void 0, function* (toastSelector = '.toast, .snackbar') {
            const toast = this.page.locator(toastSelector);
            yield toast.waitFor({ state: 'visible', timeout: 10000 });
            return (yield toast.textContent()) || '';
        });
    }
    // ==================== SCROLL UTILITIES ====================
    /**
     * Scroll element into center of view
     */
    scrollToCenter(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.evaluate((el) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            yield this.page.waitForTimeout(300);
        });
    }
    /**
     * Scroll within container
     */
    scrollWithinContainer(container, direction, pixels) {
        return __awaiter(this, void 0, void 0, function* () {
            yield container.evaluate((el, { dir, px }) => {
                el.scrollTop += dir === 'down' ? px : -px;
            }, { dir: direction, px: pixels });
        });
    }
    // ==================== VALUE EXTRACTION ====================
    /**
     * Extract numeric value from formatted string
     */
    parseNumericValue(value) {
        const cleaned = value.replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned) || 0;
    }
    /**
     * Get all options from select dropdown
     */
    getSelectOptions(select) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield select.locator('option').allTextContents();
            return options.filter(opt => opt.trim() !== '');
        });
    }
    // ==================== HOVER ACTIONS ====================
    /**
     * Hover over element
     */
    hoverElement(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.hover();
            yield this.page.waitForTimeout(200);
        });
    }
    /**
     * Hover and click
     */
    hoverAndClick(hoverLocator, clickLocator) {
        return __awaiter(this, void 0, void 0, function* () {
            yield hoverLocator.hover();
            yield this.page.waitForTimeout(200);
            yield clickLocator.click();
        });
    }
}
exports.WebActions = WebActions;
