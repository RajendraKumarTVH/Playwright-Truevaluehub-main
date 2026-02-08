"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.testConfig = {
    qa: 'https://qa.truevaluehub.com',
    demo: 'https://demo.truevaluehub.com',
    qaApi: 'https://qaapi.truevaluehub.com',
    devApi: 'https://devapi.truevaluehub.com',
    apiBaseUrl2: 'https://localhost:7256',
    apiBaseUrl: 'https://qa.truevaluehub.com',
    masterApiBaseUrl2: 'https://localhost:7027',
    masterApiBaseUrl: 'https://qa.truevaluehub.com',
    azureBlobUrl: 'https://truevaluehubdev.blob.core.windows.net',
    authClientId: 'bc0b5743-62d1-4579-94f5-bb975c2fc262',
    scopes: 'https://truevaluehubapp.onmicrosoft.com/9ce2bc1c-e0bf-4275-9f88-dcce28502d59/FullAccess',
    baseAuthority: 'https://truevaluehubapp.b2clogin.com/truevaluehubapp.onmicrosoft.com/',
    authorityDomain: 'truevaluehubapp.b2clogin.com',
    mapApiKey: 'QUl6YVN5QmFpeElFMks0eFl3ckJ3NU9GajJfSlFWUFJKVEZ5dDRZ',
    isProduction: 'false',
    username: process.env.UI_USERNAME || '',
    password: process.env.UI_PASSWORD || '',
    waitForElement: 120000,
    dbServerName: 'tvh-sql-dev.database.windows.net',
    dbPort: 1433,
    dbName: 'truevaluehub-dev',
    dbUsername: process.env.DB_USERNAME || 'tvhsqladmin',
    dbPassword: process.env.DB_PASSWORD || 'tvhsql@dm!n2022*',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};
