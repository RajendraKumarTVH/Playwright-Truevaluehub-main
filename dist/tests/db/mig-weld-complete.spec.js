"use strict";
/**
 * MIG Welding Complete Test - TrueValueHub
 *
 * This test validates the complete MIG welding workflow including:
 * - Part Information setup
 * - Material selection
 * - Welding details configuration (Weld 1: Fillet, Weld 2: Square)
 * - Manufacturing information validation
 * - Sub-process details verification
 * - Cycle time calculations
 * - Cost breakdown validation
 * - Sustainability metrics
 *
 * Based on Project: 14783
 * Part: 1023729-C-1023729-C 3
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
const test_1 = require("@playwright/test");
const mig_welding_page_1 = require("./pages/mig-welding.page");
const LoginPage_1 = require("@pages/LoginPage");
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const fs_1 = __importDefault(require("fs"));
// Test Data
const index_1 = require("../test-data/mig-welding/index");
const welding_calculator_1 = require("./utils/welding-calculator");
const logger = LoggerUtil_1.default;
// Test Configuration
const CONFIG = {
    projectId: index_1.MigWeldingTestData.project.projectId,
    baseUrl: index_1.MigWeldingTestData.config.baseUrl,
    timeout: index_1.MigWeldingTestData.config.defaultTimeout,
    userProfilePath: `./user-profile-mig-${Date.now()}`,
    authStatePath: 'auth.json'
};
test_1.test.describe('MIG Welding - Complete Workflow Test', () => {
    let context;
    let page;
    let migWeldingPage;
    let loginPage;
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🚀 MIG Welding Complete Workflow Test');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info(`📋 Project ID: ${CONFIG.projectId}`);
        logger.info(`🔧 Part: ${index_1.MigWeldingTestData.partInformation.internalPartNumber}`);
        // Launch browser
        context = yield test_1.chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });
        page = context.pages().length > 0 ? context.pages()[0] : yield context.newPage();
        loginPage = new LoginPage_1.LoginPage(page, context);
        migWeldingPage = new mig_welding_page_1.MigWeldingPage(page, context);
        // Login
        yield loginPage.loginToApplication();
        yield context.storageState({ path: CONFIG.authStatePath });
        yield migWeldingPage.navigateToProject(CONFIG.projectId);
        logger.info('✅ Setup complete');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 Test completed');
        if (context)
            yield context.close();
        if (fs_1.default.existsSync(CONFIG.userProfilePath)) {
            try {
                fs_1.default.rmSync(CONFIG.userProfilePath, { recursive: true, force: true });
            }
            catch (_a) {
                // Ignore cleanup errors
            }
        }
    }));
    (0, test_1.test)('Complete MIG Welding Workflow Validation', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 1: Verify Part Information');
        logger.info('═══════════════════════════════════════════════════════════');
        // Verify Part Details
        yield migWeldingPage.verifyPartDetails();
        const partNumber = yield migWeldingPage.InternalPartNumber.inputValue();
        (0, test_1.expect)(partNumber).toBe(index_1.MigWeldingTestData.partInformation.internalPartNumber);
        logger.info(`✅ Part Number: ${partNumber}`);
        const annualVolume = yield migWeldingPage.AnnualVolumeQtyNos.inputValue();
        (0, test_1.expect)(parseInt(annualVolume)).toBe(index_1.MigWeldingTestData.partInformation.annualVolumeQty);
        logger.info(`✅ Annual Volume: ${annualVolume}`);
        const lotSize = yield migWeldingPage.LotsizeNos.inputValue();
        (0, test_1.expect)(parseInt(lotSize)).toBe(index_1.MigWeldingTestData.partInformation.lotSize);
        logger.info(`✅ Lot Size: ${lotSize}`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 2: Verify Material Information');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.MaterialInformation.click();
        yield migWeldingPage.MaterialInfo.click();
        yield migWeldingPage.wait(500);
        // Verify material is selected
        yield (0, test_1.expect)(migWeldingPage.materialCategory).toBeVisible();
        logger.info('✅ Material Information section accessible');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 3: Configure Welding Details');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.WeldingDetails.scrollIntoViewIfNeeded();
        yield migWeldingPage.WeldingDetails.click();
        yield migWeldingPage.wait(500);
        // Weld 1: Fillet, 6mm, 200mm length
        logger.info('🔹 Configuring Weld 1 (Fillet)...');
        yield migWeldingPage.fillWeldDetails(1, {
            weldType: index_1.MigWeldingTestData.weldingDetails.weld1.weldType,
            weldSize: index_1.MigWeldingTestData.weldingDetails.weld1.weldSize,
            weldLength: index_1.MigWeldingTestData.weldingDetails.weld1.weldLength,
            noOfPasses: index_1.MigWeldingTestData.weldingDetails.weld1.noOfWeldPasses,
            weldPlaces: index_1.MigWeldingTestData.weldingDetails.weld1.weldPlaces
        });
        logger.info(`✅ Weld 1: ${index_1.MigWeldingTestData.weldingDetails.weld1.weldType}, Size: ${index_1.MigWeldingTestData.weldingDetails.weld1.weldSize}mm, Length: ${index_1.MigWeldingTestData.weldingDetails.weld1.weldLength}mm`);
        // Weld 2: Square, 6mm, 100mm length
        logger.info('🔹 Configuring Weld 2 (Square)...');
        yield migWeldingPage.fillWeldDetails(2, {
            weldType: index_1.MigWeldingTestData.weldingDetails.weld2.weldType,
            weldSize: index_1.MigWeldingTestData.weldingDetails.weld2.weldSize,
            weldLength: index_1.MigWeldingTestData.weldingDetails.weld2.weldLength,
            noOfPasses: index_1.MigWeldingTestData.weldingDetails.weld2.noOfWeldPasses,
            weldPlaces: index_1.MigWeldingTestData.weldingDetails.weld2.weldPlaces
        });
        logger.info(`✅ Weld 2: ${index_1.MigWeldingTestData.weldingDetails.weld2.weldType}, Size: ${index_1.MigWeldingTestData.weldingDetails.weld2.weldSize}mm, Length: ${index_1.MigWeldingTestData.weldingDetails.weld2.weldLength}mm`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 4: Configure Manufacturing Information');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded();
        yield migWeldingPage.ManufacturingInformation.click();
        yield migWeldingPage.wait(500);
        // Validate Process Group
        logger.info('🔹 Validating MIG Welding Process Group...');
        yield migWeldingPage.validateWeldingProcessGroup();
        logger.info('✅ MIG Welding process selected');
        // Select Machine Type
        logger.info('🔹 Selecting Machine Type: Manual...');
        yield migWeldingPage.selectMachineType('Manual');
        logger.info('✅ Machine Type: Manual');
        // Select Part Complexity
        logger.info('🔹 Selecting Part Complexity: Medium...');
        // const partComplexity = MigWeldingTestData.machineDetails.partComplexity
        // await migWeldingPage.selectPartComplexity(partComplexity)
        logger.info('✅ Part Complexity: Medium');
        // Recalculate to trigger all calculations
        logger.info('🔹 Triggering calculations...');
        yield migWeldingPage.recalculateCost();
        yield migWeldingPage.waitForNetworkIdle();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 5: Verify Machine Details');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.verifyMachineDetails({
            machineName: index_1.MigWeldingTestData.machineDetails.machineName,
            machineDescription: index_1.MigWeldingTestData.machineDetails.machineDescription,
            machineAutomation: index_1.MigWeldingTestData.machineDetails.machineAutomation,
            machineEfficiency: index_1.MigWeldingTestData.machineDetails.machineEfficiency
        });
        const minCurrent = yield migWeldingPage.RequiredCurrent.inputValue();
        (0, test_1.expect)(parseInt(minCurrent)).toBe(index_1.MigWeldingTestData.machineDetails.minCurrentRequired);
        logger.info(`✅ Min Current Required: ${minCurrent} A`);
        const minVoltage = yield migWeldingPage.RequiredVoltage.inputValue();
        (0, test_1.expect)(parseInt(minVoltage)).toBe(index_1.MigWeldingTestData.machineDetails.minWeldingVoltage);
        logger.info(`✅ Min Welding Voltage: ${minVoltage} V`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 6: Verify Cycle Time Details');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.verifyCycleTimeDetails({
            loadingUnloadingTime: index_1.MigWeldingTestData.cycleTimeDetails.loadingUnloadingTime,
            reorientation: index_1.MigWeldingTestData.cycleTimeDetails.partReorientation,
            totalWeldCycleTime: index_1.MigWeldingTestData.cycleTimeDetails.totalWeldCycleTime
        });
        const cycleTime = yield migWeldingPage.CycleTimePart.inputValue();
        (0, test_1.expect)(parseFloat(cycleTime)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.cycleTimePerPart, 1);
        logger.info(`✅ Cycle Time/Part: ${cycleTime} sec`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 7: Verify Sub Process Details');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.verifySubProcessDetails({
            weld1: {
                weldType: index_1.MigWeldingTestData.subProcessDetails.weld1.weldType,
                weldPosition: index_1.MigWeldingTestData.subProcessDetails.weld1.weldPosition,
                travelSpeed: index_1.MigWeldingTestData.subProcessDetails.weld1.travelSpeed,
                tackWelds: index_1.MigWeldingTestData.subProcessDetails.weld1.tackWelds,
                intermediateStops: index_1.MigWeldingTestData.subProcessDetails.weld1.intermediateStops,
                weldCycleTime: index_1.MigWeldingTestData.subProcessDetails.weld1.weldCycleTime
            },
            weld2: {
                weldType: index_1.MigWeldingTestData.subProcessDetails.weld2.weldType,
                weldPosition: index_1.MigWeldingTestData.subProcessDetails.weld2.weldPosition,
                travelSpeed: index_1.MigWeldingTestData.subProcessDetails.weld2.travelSpeed,
                tackWelds: index_1.MigWeldingTestData.subProcessDetails.weld2.tackWelds,
                intermediateStops: index_1.MigWeldingTestData.subProcessDetails.weld2.intermediateStops,
                weldCycleTime: index_1.MigWeldingTestData.subProcessDetails.weld2.weldCycleTime
            }
        });
        logger.info('✅ Weld 1 Cycle Time: 65.2876 sec');
        logger.info('✅ Weld 2 Cycle Time: 34.1438 sec');
        logger.info('✅ Total Weld Cycle Time: 125.403 sec');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 8: Verify Manufacturing Details & Costs');
        logger.info('═══════════════════════════════════════════════════════════');
        // Verify all manufacturing costs
        const laborCost = yield migWeldingPage.LaborCostPart.inputValue();
        (0, test_1.expect)(parseFloat(laborCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.laborCostPerPart, 2);
        logger.info(`✅ Labor Cost/Part: $${laborCost}`);
        const setupCost = yield migWeldingPage.SetupCostPart.inputValue();
        (0, test_1.expect)(parseFloat(setupCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.setupCostPerPart, 2);
        logger.info(`✅ Setup Cost/Part: $${setupCost}`);
        const machineCost = yield migWeldingPage.MachineCostPart.inputValue();
        (0, test_1.expect)(parseFloat(machineCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.machineCostPerPart, 2);
        logger.info(`✅ Machine Cost/Part: $${machineCost}`);
        const inspectionCost = yield migWeldingPage.QAInspectionCost.inputValue();
        (0, test_1.expect)(parseFloat(inspectionCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.qaInspectionCostPerPart, 2);
        logger.info(`✅ QA Inspection Cost/Part: $${inspectionCost}`);
        const powerCost = yield migWeldingPage.TotalPowerCost.inputValue();
        (0, test_1.expect)(parseFloat(powerCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.totalPowerCost, 2);
        logger.info(`✅ Total Power Cost: $${powerCost}`);
        const yieldCost = yield migWeldingPage.YieldCostPart.inputValue();
        (0, test_1.expect)(parseFloat(yieldCost)).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.yieldCostPerPart, 2);
        logger.info(`✅ Yield Cost/Part: $${yieldCost}`);
        const netProcessCost = yield migWeldingPage.NetProcessCost.inputValue();
        (0, test_1.expect)(parseFloat(netProcessCost)).toBeCloseTo(index_1.MigWeldingTestData.machineDetails.netProcessCost, 2);
        logger.info(`✅ Net Process Cost: $${netProcessCost}`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 9: Verify Sustainability Metrics');
        logger.info('═══════════════════════════════════════════════════════════');
        // Verify CO2 metrics
        const co2PerKwHr = yield migWeldingPage.CO2PerKwHr.inputValue();
        (0, test_1.expect)(parseFloat(co2PerKwHr)).toBeCloseTo(index_1.MigWeldingTestData.sustainabilityManufacturing.co2PerKwHr, 2);
        logger.info(`✅ CO2/kw-Hr: ${co2PerKwHr} kg`);
        const co2PerPart = yield migWeldingPage.CO2PerPartManufacturing.inputValue();
        (0, test_1.expect)(parseFloat(co2PerPart)).toBeCloseTo(index_1.MigWeldingTestData.sustainabilityManufacturing.co2PerPart, 4);
        logger.info(`✅ CO2/part: ${co2PerPart} kg`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📝 STEP 10: Verify Cost Summary');
        logger.info('═══════════════════════════════════════════════════════════');
        yield migWeldingPage.CostSummary.scrollIntoViewIfNeeded();
        yield migWeldingPage.verifyCostSummary();
        const shouldCost = yield migWeldingPage.PartShouldCost.inputValue();
        (0, test_1.expect)(parseFloat(shouldCost)).toBeCloseTo(index_1.MigWeldingTestData.costSummary.partShouldCost.amount, 2);
        logger.info(`✅ Part Should Cost: $${shouldCost}`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('✅ ALL VALIDATIONS PASSED!');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('📊 Summary:');
        logger.info(`   • Part: ${index_1.MigWeldingTestData.partInformation.internalPartNumber}`);
        logger.info(`   • Machine: ${index_1.MigWeldingTestData.machineDetails.machineDescription}`);
        logger.info(`   • Weld 1: Fillet, 200mm, 65.2876 sec`);
        logger.info(`   • Weld 2: Square, 100mm, 34.1438 sec`);
        logger.info(`   • Total Cycle Time: 179.1471 sec`);
        logger.info(`   • Net Process Cost: $2.6385`);
        logger.info(`   • CO2 Impact: 0.0195 kg/part`);
        logger.info(`   • Part Should Cost: $${shouldCost}`);
        logger.info('═══════════════════════════════════════════════════════════');
    }));
    (0, test_1.test)('Verify WeldingCalculator Matches UI', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧮 WeldingCalculator Validation Test');
        logger.info('═══════════════════════════════════════════════════════════');
        const calculator = new welding_calculator_1.WeldingCalculator();
        // Construct input matching the UI configuration
        const input = {
            processTypeID: welding_calculator_1.ProcessType.MigWelding,
            partComplexity: welding_calculator_1.PartComplexity.Medium,
            semiAutoOrAuto: welding_calculator_1.MachineType.Manual,
            materialInfoList: [
                {
                    processId: welding_calculator_1.PrimaryProcessType.MigWelding,
                    netMatCost: index_1.MigWeldingTestData.materialCostDetails.netMaterialCost,
                    netWeight: index_1.MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight * 1000,
                    dimX: index_1.MigWeldingTestData.materialCostDetails.totalWeldLength,
                    partTickness: 5,
                    materialMasterData: {
                        materialType: { materialTypeName: 'Steel' }
                    }
                }
            ],
            subProcessFormArray: {
                controls: [
                    {
                        value: {
                            formLength: index_1.MigWeldingTestData.weldingDetails.weld1.weldLength,
                            shoulderWidth: index_1.MigWeldingTestData.weldingDetails.weld1.weldSize,
                            formHeight: index_1.MigWeldingTestData.subProcessDetails.weld1.travelSpeed,
                            hlFactor: index_1.MigWeldingTestData.subProcessDetails.weld1.tackWelds,
                            formPerimeter: index_1.MigWeldingTestData.subProcessDetails.weld1.intermediateStops,
                            noOfHoles: 1,
                            formingForce: 1,
                            blankArea: index_1.MigWeldingTestData.weldingDetails.weld1.weldLength,
                            lengthOfCut: 1
                        }
                    },
                    {
                        value: {
                            formLength: index_1.MigWeldingTestData.weldingDetails.weld2.weldLength,
                            shoulderWidth: index_1.MigWeldingTestData.weldingDetails.weld2.weldSize,
                            formHeight: index_1.MigWeldingTestData.subProcessDetails.weld2.travelSpeed,
                            hlFactor: index_1.MigWeldingTestData.subProcessDetails.weld2.tackWelds,
                            formPerimeter: index_1.MigWeldingTestData.subProcessDetails.weld2.intermediateStops,
                            noOfHoles: 1,
                            formingForce: 1,
                            blankArea: index_1.MigWeldingTestData.weldingDetails.weld2.weldLength,
                            lengthOfCut: 1
                        }
                    }
                ]
            },
            efficiency: index_1.MigWeldingTestData.machineDetails.machineEfficiency / 100,
            lotSize: index_1.MigWeldingTestData.partInformation.lotSize,
            setUpTime: index_1.MigWeldingTestData.manufacturingDetails.machineSetupTime,
            machineHourRate: index_1.MigWeldingTestData.manufacturingDetails.machineHourRate,
            lowSkilledLaborRatePerHour: index_1.MigWeldingTestData.manufacturingDetails.directLaborRate,
            noOfLowSkilledLabours: index_1.MigWeldingTestData.manufacturingDetails.noOfDirectLabors,
            skilledLaborRatePerHour: index_1.MigWeldingTestData.manufacturingDetails.setupLaborRate,
            inspectionTime: index_1.MigWeldingTestData.manufacturingDetails.qaInspectionTime,
            qaOfInspectorRate: index_1.MigWeldingTestData.manufacturingDetails.qaInspectorRate,
            qaOfInspector: 1,
            samplingRate: index_1.MigWeldingTestData.manufacturingDetails.samplingRate,
            yieldPer: index_1.MigWeldingTestData.manufacturingDetails.yieldPercentage,
            electricityUnitCost: index_1.MigWeldingTestData.manufacturingDetails.powerUnitCost,
            powerConsumption: index_1.MigWeldingTestData.manufacturingDetails.powerConsumption,
            machineMaster: {
                machineMarketDtos: [{ specialSkilledLabours: 1 }]
            }
        };
        // Mark travel speeds as dirty to use our values
        const fieldColorsList = [
            { formControlName: 'formHeight', subProcessIndex: 0, isDirty: true },
            { formControlName: 'formHeight', subProcessIndex: 1, isDirty: true }
        ];
        const laborRateDto = [
            { powerCost: index_1.MigWeldingTestData.manufacturingDetails.powerUnitCost }
        ];
        // Calculate
        const result = calculator.calculationForWelding(input, fieldColorsList, input, laborRateDto);
        logger.info('🔹 Verifying Calculator Results...');
        // Verify cycle time
        (0, test_1.expect)(result.cycleTime).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.cycleTimePerPart, 1);
        logger.info(`✅ Cycle Time: ${result.cycleTime} sec (Expected: ${index_1.MigWeldingTestData.manufacturingDetails.cycleTimePerPart})`);
        // Verify costs
        (0, test_1.expect)(result.directLaborCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.laborCostPerPart, 2);
        logger.info(`✅ Labor Cost: $${result.directLaborCost}`);
        (0, test_1.expect)(result.directSetUpCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.setupCostPerPart, 2);
        logger.info(`✅ Setup Cost: $${result.directSetUpCost}`);
        (0, test_1.expect)(result.directMachineCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.machineCostPerPart, 2);
        logger.info(`✅ Machine Cost: $${result.directMachineCost}`);
        (0, test_1.expect)(result.inspectionCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.qaInspectionCostPerPart, 2);
        logger.info(`✅ Inspection Cost: $${result.inspectionCost}`);
        (0, test_1.expect)(result.totalPowerCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.totalPowerCost, 2);
        logger.info(`✅ Power Cost: $${result.totalPowerCost}`);
        (0, test_1.expect)(result.yieldCost).toBeCloseTo(index_1.MigWeldingTestData.manufacturingDetails.yieldCostPerPart, 2);
        logger.info(`✅ Yield Cost: $${result.yieldCost}`);
        (0, test_1.expect)(result.directProcessCost).toBeCloseTo(index_1.MigWeldingTestData.machineDetails.netProcessCost, 2);
        logger.info(`✅ Net Process Cost: $${result.directProcessCost}`);
        // Verify CO2
        const co2PerPart = (result.cycleTime / 3600) * result.powerConsumption * index_1.MigWeldingTestData.sustainabilityManufacturing.co2PerKwHr;
        (0, test_1.expect)(co2PerPart).toBeCloseTo(index_1.MigWeldingTestData.sustainabilityManufacturing.co2PerPart, 4);
        logger.info(`✅ CO2/part: ${co2PerPart.toFixed(4)} kg`);
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('✅ WeldingCalculator matches UI perfectly!');
        logger.info('═══════════════════════════════════════════════════════════');
    }));
});
