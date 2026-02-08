/**
 * WebActions - Advanced Web Interaction Utilities
 * Provides specialized methods for complex UI interactions
 */

import { Locator, Page } from '@playwright/test';
import Logger from './LoggerUtil';

const logger = Logger;

export class WebActions {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ==================== DROPDOWN ACTIONS ====================
    /**
     * Select from Material Angular mat-select dropdown
     */
    async selectMatDropdown(dropdown: Locator, optionText: string): Promise<void> {
        await dropdown.click();
        await this.page.waitForTimeout(300);
        await this.page.getByRole('option', { name: optionText }).click();
        await this.page.waitForTimeout(200);
        logger.info(`✔ Selected: ${optionText}`);
    }

    /**
     * Select from autocomplete with search
     */
    async selectAutocomplete(input: Locator, searchText: string, optionText: string): Promise<void> {
        await input.click();
        await input.fill(searchText);
        await this.page.waitForTimeout(500);
        await this.page.getByRole('option', { name: optionText }).first().click();
        logger.info(`✔ Selected autocomplete: ${optionText}`);
    }

    /**
     * Select from native HTML select
     */
    async selectNativeDropdown(select: Locator, value: string): Promise<void> {
        await select.selectOption({ label: value });
        await this.page.keyboard.press('Tab');
        logger.info(`✔ Selected native: ${value}`);
    }

    // ==================== FORM ACTIONS ====================
    /**
     * Fill input field with validation
     */
    async fillInput(locator: Locator, value: string | number): Promise<void> {
        const stringValue = String(value);
        await locator.waitFor({ state: 'visible' });
        await locator.scrollIntoViewIfNeeded();
        await locator.fill('');
        await locator.fill(stringValue);
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(200);
    }

    /**
     * Clear and type with delay (for masked inputs)
     */
    async clearAndType(locator: Locator, value: string): Promise<void> {
        await locator.click();
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        await this.page.keyboard.type(value, { delay: 50 });
        await this.page.keyboard.press('Tab');
    }

    /**
     * Fill multiple fields from data object
     */
    async fillForm(fields: { locator: Locator; value: string | number }[]): Promise<void> {
        for (const field of fields) {
            await this.fillInput(field.locator, field.value);
        }
        logger.info(`✔ Filled ${fields.length} form fields`);
    }

    // ==================== CHECKBOX & RADIO ====================
    /**
     * Set checkbox state
     */
    async setCheckbox(checkbox: Locator, checked: boolean): Promise<void> {
        const isChecked = await checkbox.isChecked();
        if (isChecked !== checked) {
            await checkbox.click();
        }
        logger.info(`✔ Checkbox set to: ${checked}`);
    }

    /**
     * Select radio option
     */
    async selectRadio(radio: Locator): Promise<void> {
        if (!(await radio.isChecked())) {
            await radio.click();
        }
    }

    // ==================== TABLE ACTIONS ====================
    /**
     * Get table cell value
     */
    async getTableCellValue(table: Locator, row: number, column: number): Promise<string> {
        const cell = table.locator(`tr:nth-child(${row}) td:nth-child(${column})`);
        return await cell.textContent() || '';
    }

    /**
     * Click table row by text content
     */
    async clickTableRowByText(table: Locator, text: string): Promise<void> {
        const row = table.locator('tr', { hasText: text });
        await row.click();
    }

    /**
     * Get table row count
     */
    async getTableRowCount(table: Locator): Promise<number> {
        return await table.locator('tbody tr').count();
    }

    // ==================== EXPANSION PANELS ====================
    /**
     * Expand accordion panel
     */
    async expandPanel(panelHeader: Locator): Promise<void> {
        const isExpanded = await panelHeader.getAttribute('aria-expanded');
        if (isExpanded !== 'true') {
            await panelHeader.click();
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Collapse accordion panel
     */
    async collapsePanel(panelHeader: Locator): Promise<void> {
        const isExpanded = await panelHeader.getAttribute('aria-expanded');
        if (isExpanded === 'true') {
            await panelHeader.click();
            await this.page.waitForTimeout(300);
        }
    }

    // ==================== TAB ACTIONS ====================
    /**
     * Click tab by name
     */
    async selectTab(tabName: string): Promise<void> {
        const tab = this.page.getByRole('tab', { name: tabName });
        await tab.click();
        await this.page.waitForTimeout(300);
        logger.info(`✔ Selected tab: ${tabName}`);
    }

    // ==================== DIALOG ACTIONS ====================
    /**
     * Handle confirmation dialog
     */
    async acceptDialog(): Promise<void> {
        this.page.on('dialog', async dialog => {
            await dialog.accept();
        });
    }

    /**
     * Handle and dismiss dialog
     */
    async dismissDialog(): Promise<void> {
        this.page.on('dialog', async dialog => {
            await dialog.dismiss();
        });
    }

    /**
     * Click button in modal
     */
    async clickModalButton(buttonText: string): Promise<void> {
        await this.page.getByRole('button', { name: buttonText }).click();
        await this.page.waitForTimeout(500);
    }

    // ==================== WAIT UTILITIES ====================
    /**
     * Wait for element with custom timeout
     */
    async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    /**
     * Wait for loading spinner to disappear
     */
    async waitForLoading(spinnerSelector: string = '.loading-spinner'): Promise<void> {
        const spinner = this.page.locator(spinnerSelector);
        await spinner.waitFor({ state: 'hidden', timeout: 30000 });
    }

    /**
     * Wait for toast/notification
     */
    async waitForToast(toastSelector: string = '.toast, .snackbar'): Promise<string> {
        const toast = this.page.locator(toastSelector);
        await toast.waitFor({ state: 'visible', timeout: 10000 });
        return await toast.textContent() || '';
    }

    // ==================== SCROLL UTILITIES ====================
    /**
     * Scroll element into center of view
     */
    async scrollToCenter(locator: Locator): Promise<void> {
        await locator.evaluate((el) => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await this.page.waitForTimeout(300);
    }

    /**
     * Scroll within container
     */
    async scrollWithinContainer(container: Locator, direction: 'up' | 'down', pixels: number): Promise<void> {
        await container.evaluate((el, { dir, px }) => {
            el.scrollTop += dir === 'down' ? px : -px;
        }, { dir: direction, px: pixels });
    }

    // ==================== VALUE EXTRACTION ====================
    /**
     * Extract numeric value from formatted string
     */
    parseNumericValue(value: string): number {
        const cleaned = value.replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned) || 0;
    }

    /**
     * Get all options from select dropdown
     */
    async getSelectOptions(select: Locator): Promise<string[]> {
        const options = await select.locator('option').allTextContents();
        return options.filter(opt => opt.trim() !== '');
    }

    // ==================== HOVER ACTIONS ====================
    /**
     * Hover over element
     */
    async hoverElement(locator: Locator): Promise<void> {
        await locator.hover();
        await this.page.waitForTimeout(200);
    }

    /**
     * Hover and click
     */
    async hoverAndClick(hoverLocator: Locator, clickLocator: Locator): Promise<void> {
        await hoverLocator.hover();
        await this.page.waitForTimeout(200);
        await clickLocator.click();
    }
}
