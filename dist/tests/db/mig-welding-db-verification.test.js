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
const test_1 = require("@playwright/test");
const dbHelper_1 = require("./utils/dbHelper");
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
test_1.test.describe('MIG Welding DB Verification', () => {
    (0, test_1.test)('Verify Material Price and Scrap Price for MIG Welding Material', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const materialName = 'Steel Sheet'; // Using a known material from existing tests
            logger.info(`Querying DB for Material: ${materialName}`);
            const query = `
                SELECT TOP 1 
                    mm.MaterialMarketId,
                    mm.Price, 
                    mm.GeneralScrapPrice, 
                    mm.MarketMonth,
                    m.MaterialName
                FROM MaterialMarket mm
                JOIN MaterialMaster m ON mm.MaterialMasterId = m.MaterialMasterId
                WHERE m.MaterialName = '${materialName}'
                ORDER BY mm.MarketMonth DESC
            `;
            const result = yield (0, dbHelper_1.queryDatabase)(query);
            if (result.length === 0) {
                console.error(`❌ No data found for material: ${materialName}`);
                throw new Error(`No data found for material: ${materialName}`);
            }
            const data = result[0];
            console.log(`✅ DB Data for ${materialName}:`, JSON.stringify(data, null, 2));
            // Verify Material Price
            (0, test_1.expect)(data.Price).toBeDefined();
            (0, test_1.expect)(Number(data.Price)).toBeGreaterThan(0);
            // logger.info(`✅ Material Price verified: ${data.Price}`); // Removed as per instruction
            // Verify Scrap Price
            (0, test_1.expect)(data.GeneralScrapPrice).toBeDefined();
            // Scrap price might be 0, but usually positive for steel
            (0, test_1.expect)(Number(data.GeneralScrapPrice)).toBeGreaterThanOrEqual(0);
            // logger.info(`✅ Scrap Price verified: ${data.GeneralScrapPrice}`); // Removed as per instruction
        }
        catch (err) {
            console.error('❌ Test Failed:', err);
            throw err;
        }
    }));
    (0, test_1.test)('Verify Machine Hour Rate (MHR) for MIG Welding Machine', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Step 1: Find a MIG Welding Machine
            // ProcessTypeID for MIG Welding is likely 57 (Primary) or 39 (ProcessType) based on welding-calculator.ts
            // We will look for machines that have 'MIG' in name or description
            logger.info('Querying DB for MIG Welding Machines...');
            // We try to find a machine that is relevant to MIG welding.
            // Checking MachineMaster/MedbMachinesMaster. Adjust table name if query fails.
            // Based on MedbMachinesMasterDto, table is likely MedbMachinesMaster or MachineMaster.
            // We will try MachineMaster first as it matches MaterialMaster pattern.
            const machineQuery = `
                SELECT TOP 1 
                    m.MachineID, 
                    m.MachineName, 
                    m.MachineDescription, 
                    m.MachineHourRate
                FROM MachineMaster m
                WHERE m.MachineDescription LIKE '%MIG%' OR m.MachineName LIKE '%MIG%'
                ORDER BY m.MachineID DESC
            `;
            let result;
            try {
                result = yield (0, dbHelper_1.queryDatabase)(machineQuery);
            }
            catch (e) {
                console.warn('MachineMaster query failed, trying MedbMachinesMaster. Error:', e);
                // Fallback to MedbMachinesMaster if MachineMaster fails
                const fallbackQuery = `
                    SELECT TOP 1 
                        m.MachineID, 
                        m.MachineName, 
                        m.MachineDescription, 
                        m.MachineHourRate
                    FROM MedbMachinesMaster m
                    WHERE m.MachineDescription LIKE '%MIG%' OR m.MachineName LIKE '%MIG%'
                    ORDER BY m.MachineID DESC
                `;
                result = yield (0, dbHelper_1.queryDatabase)(fallbackQuery);
            }
            if (result.length === 0) {
                console.error('❌ No MIG welding machines found in DB');
                throw new Error('No MIG welding machines found in DB');
            }
            const machineData = result[0];
            console.log(`✅ MIG Welding Machine Found:`, JSON.stringify(machineData, null, 2));
            // Step 2: Verify MHR
            (0, test_1.expect)(machineData.MachineHourRate).toBeDefined();
            (0, test_1.expect)(Number(machineData.MachineHourRate)).toBeGreaterThan(0);
            // logger.info(`✅ Machine Hour Rate (MHR) verified: ${machineData.MachineHourRate}`); // Removed as per instruction
        }
        catch (err) {
            console.error('❌ Test Failed:', err);
            throw err;
        }
    }));
});
