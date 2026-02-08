
import { test, expect } from '@playwright/test';
import { queryDatabase } from './utils/dbHelper';
import Logger from './lib/LoggerUtil';

const logger = Logger;

test.describe('MIG Welding DB Verification', () => {

    test('Verify Material Price and Scrap Price for MIG Welding Material', async () => {
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

            const result = await queryDatabase(query);

            if (result.length === 0) {
                console.error(`❌ No data found for material: ${materialName}`);
                throw new Error(`No data found for material: ${materialName}`);
            }

            const data = result[0];
            console.log(`✅ DB Data for ${materialName}:`, JSON.stringify(data, null, 2));

            // Verify Material Price
            expect(data.Price).toBeDefined();
            expect(Number(data.Price)).toBeGreaterThan(0);
            // logger.info(`✅ Material Price verified: ${data.Price}`); // Removed as per instruction

            // Verify Scrap Price
            expect(data.GeneralScrapPrice).toBeDefined();
            // Scrap price might be 0, but usually positive for steel
            expect(Number(data.GeneralScrapPrice)).toBeGreaterThanOrEqual(0);
            // logger.info(`✅ Scrap Price verified: ${data.GeneralScrapPrice}`); // Removed as per instruction
        } catch (err) {
            console.error('❌ Test Failed:', err);
            throw err;
        }
    });

    test('Verify Machine Hour Rate (MHR) for MIG Welding Machine', async () => {
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
                result = await queryDatabase(machineQuery);
            } catch (e) {
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
                result = await queryDatabase(fallbackQuery);
            }

            if (result.length === 0) {
                console.error('❌ No MIG welding machines found in DB');
                throw new Error('No MIG welding machines found in DB');
            }

            const machineData = result[0];
            console.log(`✅ MIG Welding Machine Found:`, JSON.stringify(machineData, null, 2));

            // Step 2: Verify MHR
            expect(machineData.MachineHourRate).toBeDefined();
            expect(Number(machineData.MachineHourRate)).toBeGreaterThan(0);
            // logger.info(`✅ Machine Hour Rate (MHR) verified: ${machineData.MachineHourRate}`); // Removed as per instruction
        } catch (err) {
            console.error('❌ Test Failed:', err);
            throw err;
        }
    });

});
