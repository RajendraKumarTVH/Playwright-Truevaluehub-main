"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/db-verify-azurecli-sso.test.ts
const test_1 = require("@playwright/test");
const sql = __importStar(require("mssql"));
const identity_1 = require("@azure/identity");
require("dotenv/config");
(0, test_1.test)('DB Connection Test (Azure CLI SSO)', () => __awaiter(void 0, void 0, void 0, function* () {
    const server = process.env.DB_SERVER || 'tvh-sql-dev.database.windows.net';
    const database = process.env.DB_NAME || 'truevaluehub-qa-master';
    const port = Number(process.env.DB_PORT) || 1433;
    console.log('Starting DB connection test using Azure CLI SSO...');
    console.log(`Server: ${server}`);
    console.log(`Database: ${database}`);
    console.log(`Port: ${port}`);
    const credential = new identity_1.AzureCliCredential();
    try {
        // Acquire access token from Azure CLI login
        const accessToken = yield credential.getToken('https://database.windows.net/.default');
        if (!accessToken)
            throw new Error('Failed to acquire Azure AD access token');
        const config = {
            server,
            database,
            port,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
            authentication: {
                type: 'azure-active-directory-access-token',
                options: {
                    token: accessToken.token
                }
            }
        };
        const pool = yield sql.connect(config);
        console.log('✅ SSO Connection successful!');
        const marketResult = yield pool
            .request()
            .query('SELECT TOP 1 * FROM MaterialMarket');
        console.log('MaterialMarket Columns:', Object.keys(marketResult.recordset[0]));
        const masterResult = yield pool
            .request()
            .query('SELECT TOP 1 * FROM MaterialMaster');
        console.log('MaterialMaster Columns:', Object.keys(masterResult.recordset[0]));
        yield pool.close();
        console.log('Connection closed.');
    }
    catch (err) {
        const error = err;
        console.error('❌ SSO Connection failed:', error.message || err);
        throw err; // fail the Playwright test
    }
}));
