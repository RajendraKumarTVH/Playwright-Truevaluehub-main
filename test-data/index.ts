/**
 * Test Data - Barrel Export
 * Central export point for all test data files
 */

// MIG Welding Test Data
export {
    TestConfig,
    ProjectData,
    PartInformation,
    SupplyTerms,
    MaterialInformation,
    PartDetails,
    WeldingDetails,
    MaterialCostDetails,
    SustainabilityMaterial,
    ManufacturingInformation,
    MachineDetails,
    CycleTimeDetails,
    SubProcessDetails,
    ManufacturingDetails,
    SustainabilityManufacturing,
    CostSummary,
    Opportunity,
    ESG,
    ExpectedValues,
    DropdownOptions,
    getWeldElementSize,
    calculateTotalWeldLength,
    compareWithTolerance,
    MigWeldingTestData,
    Scenario2_DifferentWeldConfig,
    Scenario3_AutomaticMachine,
    Scenario4_HighVolume
} from './mig-welding-testdata';

// Excel Reader Utility
export {
    MigWeldingExcelReader,
    readMigWeldingTestData,
    getDefaultExcelPath,
    // Interfaces
    MigWeldingExcelData,
    ProjectExcelData,
    PartInfoExcelData,
    SupplyTermsExcelData,
    MaterialInfoExcelData,
    PartDetailsExcelData,
    WeldingDetailsExcelData,
    MachineDetailsExcelData,
    ManufacturingDetailsExcelData,
    CostSummaryExcelData
} from './excel-reader';
