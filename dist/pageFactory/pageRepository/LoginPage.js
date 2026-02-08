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
exports.LoginPage = void 0;
const test_1 = require("@playwright/test");
const WebActions_1 = require("@lib/WebActions");
const LoggerUtil_1 = __importDefault(require("@lib/LoggerUtil"));
const testConfig_1 = require("../../testConfig");
class LoginPage {
    constructor(page, context) {
        this.page = page;
        this.context = context;
        this.webActions = new WebActions_1.WebActions(this.page, this.context);
        this.LoginHeading = page.locator('//h1[normalize-space(text())="Sign in"]');
        this.TrueValueHubSSo = page.locator('#TrueValueHubSSO');
        this.PageTitle = page.locator('.logo-title');
        this.UsernameInput = page.locator('input[name="Username"]');
        this.PasswordInput = page.locator('input[type="password"]');
        this.SubmitButton = page.locator('button[type="submit"]');
    }
    // ============================================================
    // Navigation
    // ============================================================
    navigateToURL() {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info(`🌐 Navigating to: ${testConfig_1.testConfig.qa}`);
            yield this.page.goto(testConfig_1.testConfig.qa, { waitUntil: 'load' });
            yield this.page.waitForLoadState('domcontentloaded');
        });
    }
    // ============================================================
    // Main Login Flow
    // ============================================================
    loginToApplication() {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info('🔑 Starting Login Flow...');
            yield this.navigateToURL();
            // Give SPA time to stabilize (no hard sleep dependency)
            yield this.LoginHeading.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null);
            if (!(yield this.isLoginPage())) {
                LoggerUtil_1.default.info('✅ Already logged in, skipping SSO flow.');
                yield this.verifyPageTitle();
                return;
            }
            yield this.openSSOIfVisible();
            yield this.performSSOLoginIfRequired();
            yield this.verifyPageTitle();
        });
    }
    // ============================================================
    // SSO Actions
    // ============================================================
    openSSOIfVisible() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.TrueValueHubSSo.isVisible({ timeout: 5000 }).catch(() => false)) {
                LoggerUtil_1.default.info('🖱️ Clicking SSO button...');
                yield this.TrueValueHubSSo.scrollIntoViewIfNeeded();
                yield this.TrueValueHubSSo.click({ force: true });
            }
            else {
                LoggerUtil_1.default.info('ℹ️ SSO button not visible — possibly already redirected.');
            }
        });
    }
    performSSOLoginIfRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(yield this.UsernameInput.isVisible({ timeout: 6000 }).catch(() => false))) {
                    LoggerUtil_1.default.info('ℹ️ Username field not visible — login probably already completed.');
                    return;
                }
                LoggerUtil_1.default.info('📧 Entering SSO credentials...');
                yield this.safeType(this.UsernameInput, testConfig_1.testConfig.username, 'Username');
                yield this.safeType(this.PasswordInput, testConfig_1.testConfig.password, 'Password');
                yield this.SubmitButton.waitFor({ state: 'visible', timeout: 5000 });
                yield this.SubmitButton.click();
                LoggerUtil_1.default.info('🚀 Login form submitted');
            }
            catch (error) {
                LoggerUtil_1.default.error(`❌ Failed during SSO login: ${error.message}`);
                throw error;
            }
        });
    }
    safeType(locator, value, label) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible', timeout: 8000 });
            yield locator.scrollIntoViewIfNeeded();
            yield locator.click({ force: true });
            yield locator.fill('');
            yield this.page.waitForTimeout(150);
            yield locator.type(value, { delay: 60 });
            yield (0, test_1.expect)(locator).toHaveValue(value, { timeout: 3000 });
            LoggerUtil_1.default.info(`✅ ${label} entered successfully`);
        });
    }
    verifyPageTitle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
                yield (0, test_1.expect)(this.page).toHaveTitle(/True\s*ValueHub/i, {
                    timeout: 30000
                });
                if (yield this.PageTitle.isVisible().catch(() => false)) {
                    LoggerUtil_1.default.info('🖼️ Logo title is visible');
                }
                LoggerUtil_1.default.info('✅ Login verified successfully');
            }
            catch (error) {
                LoggerUtil_1.default.error('❌ Login verification failed');
                LoggerUtil_1.default.error(`🌐 Current URL: ${this.page.url()}`);
                throw error;
            }
        });
    }
    isLoginPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                LoggerUtil_1.default.info('🔍 Checking if login page is visible...');
                const isSsoVisible = yield this.TrueValueHubSSo
                    .isVisible({ timeout: 2000 })
                    .catch(() => false);
                const isUsernameVisible = yield this.UsernameInput
                    .isVisible({ timeout: 2000 })
                    .catch(() => false);
                LoggerUtil_1.default.info(`   • SSO Button Visible     : ${isSsoVisible}`);
                LoggerUtil_1.default.info(`   • Username Input Visible: ${isUsernameVisible}`);
                return isSsoVisible || isUsernameVisible;
            }
            catch (_a) {
                return false;
            }
        });
    }
}
exports.LoginPage = LoginPage;
