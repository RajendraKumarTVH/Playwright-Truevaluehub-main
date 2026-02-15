/**
 * Excel Test Data Reader Utility
 * Provides functions to read MIG Welding test data from Excel files
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

// ==================== INTERFACES ====================
export interface MigWeldingExcelData {
    projectData: ProjectExcelData;
    partInformation: PartInfoExcelData;
    supplyTerms: SupplyTermsExcelData;
    materialInformation: MaterialInfoExcelData;
    partDetails: PartDetailsExcelData;
    weldingDetails: WeldingDetailsExcelData[];
    machineDetails: MachineDetailsExcelData;
    manufacturingDetails: ManufacturingDetailsExcelData;
    costSummary: CostSummaryExcelData;
}

export interface ProjectExcelData {
    projectId: string;
    projectName: string;
    targetMonth: string;
    createdBy: string;
    status: string;
}

export interface PartInfoExcelData {
    internalPartNumber: string;
    drawingNumber: string;
    revisionNumber: string;
    partDescription: string;
    manufacturingCategory: string;
    bomQty: number;
    annualVolumeQty: number;
    lotSize: number;
    productLifeRemaining: number;
    lifeTimeQtyRemaining: number;
}

export interface SupplyTermsExcelData {
    supplierName: string;
    manufacturingCity: string;
    manufacturingCountry: string;
    deliverySiteName: string;
    deliveryCity: string;
    deliveryCountry: string;
}

export interface MaterialInfoExcelData {
    processGroup: string;
    category: string;
    family: string;
    descriptionGrade: string;
    stockForm: string;
    scrapPrice: number;
    materialPrice: number;
    volumePurchased: number;
    volumeDiscount: number;
    discountedMaterialPrice: number;
}

export interface PartDetailsExcelData {
    partEnvelopeLength: number;
    partEnvelopeWidth: number;
    partEnvelopeHeight: number;
    netWeight: number;
    partSurfaceArea: number;
    partVolume: number;
}

export interface WeldingDetailsExcelData {
    weldNumber: number;
    weldType: string;
    weldSize: number;
    wireDia: number;
    weldElementSize: number;
    noOfWeldPasses: number;
    weldLength: number;
    weldSide: string;
    weldPlaces: number;
    grindFlush: string;
    weldPosition: string;
    travelSpeed: number;
    tackWelds: number;
    intermediateStops: number;
    weldCycleTime: number;
}

export interface MachineDetailsExcelData {
    processGroup: string;
    minCurrentRequired: number;
    minWeldingVoltage: number;
    selectedCurrent: number;
    selectedVoltage: number;
    machineName: string;
    machineDescription: string;
    machineAutomation: string;
    samplingPlan: string;
    machineEfficiency: number;
    machineHourRate: number;
    netProcessCost: number;
}

export interface ManufacturingDetailsExcelData {
    loadingUnloadingTime: number;
    partReorientation: number;
    totalWeldCycleTime: number;
    samplingRate: number;
    yieldPercentage: number;
    yieldCostPerPart: number;
    directLaborRate: number;
    noOfDirectLabors: number;
    laborCostPerPart: number;
    setupLaborRate: number;
    machineSetupTime: number;
    setupCostPerPart: number;
    qaInspectorRate: number;
    qaInspectionTime: number;
    qaInspectionCostPerPart: number;
    cycleTimePerPart: number;
    machineCostPerPart: number;
    powerUnitCost: number;
    powerConsumption: number;
    totalPowerCost: number;
}

export interface CostSummaryExcelData {
    materialCost: number;
    materialCostPercent: number;
    manufacturingCost: number;
    manufacturingCostPercent: number;
    toolingCost: number;
    toolingCostPercent: number;
    overheadProfit: number;
    overheadProfitPercent: number;
    packingCost: number;
    packingCostPercent: number;
    exwPartCost: number;
    exwPartCostPercent: number;
    freightCost: number;
    freightCostPercent: number;
    dutiesTariff: number;
    dutiesTariffPercent: number;
    partShouldCost: number;
    partShouldCostPercent: number;
}

// ==================== EXCEL READER CLASS ====================
export class MigWeldingExcelReader {
    private workbook: XLSX.WorkBook;
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        // Read with sheetRows: 0 to load ALL rows (default is 200)
        this.workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    }

    /**
     * Read a specific sheet as JSON
     */
    private readSheet<T>(sheetName: string): T[] {
        const worksheet = this.workbook.Sheets[sheetName];
        if (!worksheet) {
            throw new Error(`Sheet '${sheetName}' not found in ${this.filePath}`);
        }
        return XLSX.utils.sheet_to_json<T>(worksheet);
    }

    /**
     * Read a specific cell value
     */
    private getCellValue(sheetName: string, cellAddress: string): any {
        const worksheet = this.workbook.Sheets[sheetName];
        if (!worksheet) return null;
        const cell = worksheet[cellAddress];
        return cell ? cell.v : null;
    }

    /**
     * Read Project Data from Excel
     */
    readProjectData(): ProjectExcelData {
        const data = this.readSheet<any>('ProjectData');
        if (data.length === 0) {
            return {
                projectId: '',
                projectName: '',
                targetMonth: '',
                createdBy: '',
                status: ''
            };
        }
        const row = data[0];
        return {
            projectId: String(row['Project ID'] || row['projectId'] || ''),
            projectName: String(row['Project Name'] || row['projectName'] || ''),
            targetMonth: String(row['Target Month'] || row['targetMonth'] || ''),
            createdBy: String(row['Created By'] || row['createdBy'] || ''),
            status: String(row['Status'] || row['status'] || '')
        };
    }

    /**
     * Read Part Information from Excel
     */
    readPartInformation(): PartInfoExcelData {
        const data = this.readSheet<any>('PartInformation');
        if (data.length === 0) {
            throw new Error('PartInformation sheet is empty');
        }
        const row = data[0];
        return {
            internalPartNumber: String(row['Internal Part Number'] || row['internalPartNumber'] || ''),
            drawingNumber: String(row['Drawing Number'] || row['drawingNumber'] || ''),
            revisionNumber: String(row['Revision Number'] || row['revisionNumber'] || ''),
            partDescription: String(row['Part Description'] || row['partDescription'] || ''),
            manufacturingCategory: String(row['Manufacturing Category'] || row['manufacturingCategory'] || ''),
            bomQty: Number(row['BOM Qty'] || row['bomQty'] || 1),
            annualVolumeQty: Number(row['Annual Volume Qty'] || row['annualVolumeQty'] || 0),
            lotSize: Number(row['Lot Size'] || row['lotSize'] || 0),
            productLifeRemaining: Number(row['Product Life Remaining'] || row['productLifeRemaining'] || 0),
            lifeTimeQtyRemaining: Number(row['Life Time Qty Remaining'] || row['lifeTimeQtyRemaining'] || 0)
        };
    }

    /**
     * Read Supply Terms from Excel
     */
    readSupplyTerms(): SupplyTermsExcelData {
        const data = this.readSheet<any>('SupplyTerms');
        if (data.length === 0) {
            return {
                supplierName: '',
                manufacturingCity: '',
                manufacturingCountry: '',
                deliverySiteName: '',
                deliveryCity: '',
                deliveryCountry: ''
            };
        }
        const row = data[0];
        return {
            supplierName: String(row['Supplier Name'] || row['supplierName'] || ''),
            manufacturingCity: String(row['Manufacturing City'] || row['manufacturingCity'] || ''),
            manufacturingCountry: String(row['Manufacturing Country'] || row['manufacturingCountry'] || ''),
            deliverySiteName: String(row['Delivery Site Name'] || row['deliverySiteName'] || ''),
            deliveryCity: String(row['Delivery City'] || row['deliveryCity'] || ''),
            deliveryCountry: String(row['Delivery Country'] || row['deliveryCountry'] || '')
        };
    }

    /**
     * Read Material Information from Excel
     */
    readMaterialInformation(): MaterialInfoExcelData {
        const data = this.readSheet<any>('MaterialInformation');
        if (data.length === 0) {
            throw new Error('MaterialInformation sheet is empty');
        }
        const row = data[0];
        return {
            processGroup: String(row['Process Group'] || row['processGroup'] || ''),
            category: String(row['Category'] || row['category'] || ''),
            family: String(row['Family'] || row['family'] || ''),
            descriptionGrade: String(row['Description/Grade'] || row['descriptionGrade'] || ''),
            stockForm: String(row['Stock Form'] || row['stockForm'] || ''),
            scrapPrice: Number(row['Scrap Price'] || row['scrapPrice'] || 0),
            materialPrice: Number(row['Material Price'] || row['materialPrice'] || 0),
            volumePurchased: Number(row['Volume Purchased'] || row['volumePurchased'] || 0),
            volumeDiscount: Number(row['Volume Discount'] || row['volumeDiscount'] || 0),
            discountedMaterialPrice: Number(row['Discounted Material Price'] || row['discountedMaterialPrice'] || 0)
        };
    }

    /**
     * Read Part Details from Excel
     */
    readPartDetails(): PartDetailsExcelData {
        const data = this.readSheet<any>('PartDetails');
        if (data.length === 0) {
            throw new Error('PartDetails sheet is empty');
        }
        const row = data[0];
        return {
            partEnvelopeLength: Number(row['Part Envelope Length'] || row['partEnvelopeLength'] || 0),
            partEnvelopeWidth: Number(row['Part Envelope Width'] || row['partEnvelopeWidth'] || 0),
            partEnvelopeHeight: Number(row['Part Envelope Height'] || row['partEnvelopeHeight'] || 0),
            netWeight: Number(row['Net Weight'] || row['netWeight'] || 0),
            partSurfaceArea: Number(row['Part Surface Area'] || row['partSurfaceArea'] || 0),
            partVolume: Number(row['Part Volume'] || row['partVolume'] || 0)
        };
    }

    /**
     * Read Welding Details from Excel (multiple rows for multiple welds)
     */
    readWeldingDetails(): WeldingDetailsExcelData[] {
        const data = this.readSheet<any>('WeldingDetails');
        return data.map((row, index) => ({
            weldNumber: Number(row['Weld Number'] || row['weldNumber'] || index + 1),
            weldType: String(row['Weld Type'] || row['weldType'] || ''),
            weldSize: Number(row['Weld Size'] || row['weldSize'] || 0),
            wireDia: Number(row['Wire Dia'] || row['wireDia'] || 0),
            weldElementSize: Number(row['Weld Element Size'] || row['weldElementSize'] || 0),
            noOfWeldPasses: Number(row['No. of Weld Passes'] || row['noOfWeldPasses'] || 1),
            weldLength: Number(row['Weld Length'] || row['weldLength'] || 0),
            weldSide: String(row['Weld Side'] || row['weldSide'] || ''),
            weldPlaces: Number(row['Weld Places'] || row['weldPlaces'] || 1),
            grindFlush: String(row['Grind Flush'] || row['grindFlush'] || 'No'),
            weldPosition: String(row['Weld Position'] || row['weldPosition'] || 'Flat'),
            travelSpeed: Number(row['Travel Speed'] || row['travelSpeed'] || 0),
            tackWelds: Number(row['Tack Welds'] || row['tackWelds'] || 0),
            intermediateStops: Number(row['Intermediate Stops'] || row['intermediateStops'] || 0),
            weldCycleTime: Number(row['Weld Cycle Time'] || row['weldCycleTime'] || 0)
        }));
    }

    /**
     * Read Machine Details from Excel
     */
    readMachineDetails(): MachineDetailsExcelData {
        const data = this.readSheet<any>('MachineDetails');
        if (data.length === 0) {
            throw new Error('MachineDetails sheet is empty');
        }
        const row = data[0];
        return {
            processGroup: String(row['Process Group'] || row['processGroup'] || ''),
            minCurrentRequired: Number(row['Min. Current Required'] || row['minCurrentRequired'] || 0),
            minWeldingVoltage: Number(row['Min. Welding Voltage'] || row['minWeldingVoltage'] || 0),
            selectedCurrent: Number(row['Selected Current'] || row['selectedCurrent'] || 0),
            selectedVoltage: Number(row['Selected Voltage'] || row['selectedVoltage'] || 0),
            machineName: String(row['Machine Name'] || row['machineName'] || ''),
            machineDescription: String(row['Machine Description'] || row['machineDescription'] || ''),
            machineAutomation: String(row['M/c Automation'] || row['machineAutomation'] || ''),
            samplingPlan: String(row['Sampling Plan'] || row['samplingPlan'] || ''),
            machineEfficiency: Number(row['Machine Efficiency'] || row['machineEfficiency'] || 0),
            machineHourRate: Number(row['Machine Hour Rate'] || row['machineHourRate'] || 0),
            netProcessCost: Number(row['Net Process Cost'] || row['netProcessCost'] || 0)
        };
    }

    /**
     * Read Manufacturing Details from Excel
     */
    readManufacturingDetails(): ManufacturingDetailsExcelData {
        const data = this.readSheet<any>('ManufacturingDetails');
        if (data.length === 0) {
            throw new Error('ManufacturingDetails sheet is empty');
        }
        const row = data[0];
        return {
            loadingUnloadingTime: Number(row['Loading/Unloading Time'] || row['loadingUnloadingTime'] || 0),
            partReorientation: Number(row['Part Reorientation'] || row['partReorientation'] || 0),
            totalWeldCycleTime: Number(row['Total Weld Cycle Time'] || row['totalWeldCycleTime'] || 0),
            samplingRate: Number(row['Sampling Rate'] || row['samplingRate'] || 0),
            yieldPercentage: Number(row['Yield Percentage'] || row['yieldPercentage'] || 0),
            yieldCostPerPart: Number(row['Yield Cost/Part'] || row['yieldCostPerPart'] || 0),
            directLaborRate: Number(row['Direct Labor Rate'] || row['directLaborRate'] || 0),
            noOfDirectLabors: Number(row['# of Direct Labors'] || row['noOfDirectLabors'] || 0),
            laborCostPerPart: Number(row['Labor Cost/Part'] || row['laborCostPerPart'] || 0),
            setupLaborRate: Number(row['Set-up Labor Rate'] || row['setupLaborRate'] || 0),
            machineSetupTime: Number(row['Machine Setup Time'] || row['machineSetupTime'] || 0),
            setupCostPerPart: Number(row['Setup Cost/Part'] || row['setupCostPerPart'] || 0),
            qaInspectorRate: Number(row['QA Inspector Rate'] || row['qaInspectorRate'] || 0),
            qaInspectionTime: Number(row['QA Inspection Time'] || row['qaInspectionTime'] || 0),
            qaInspectionCostPerPart: Number(row['QA Inspection Cost/Part'] || row['qaInspectionCostPerPart'] || 0),
            cycleTimePerPart: Number(row['Cycle Time/Part'] || row['cycleTimePerPart'] || 0),
            machineCostPerPart: Number(row['Machine Cost/Part'] || row['machineCostPerPart'] || 0),
            powerUnitCost: Number(row['Power Unit Cost'] || row['powerUnitCost'] || 0),
            powerConsumption: Number(row['Power Consumption'] || row['powerConsumption'] || 0),
            totalPowerCost: Number(row['Total Power Cost'] || row['totalPowerCost'] || 0)
        };
    }

    /**
     * Read Cost Summary from Excel
     */
    readCostSummary(): CostSummaryExcelData {
        const data = this.readSheet<any>('CostSummary');
        if (data.length === 0) {
            throw new Error('CostSummary sheet is empty');
        }
        const row = data[0];
        return {
            materialCost: Number(row['Material Cost'] || row['materialCost'] || 0),
            materialCostPercent: Number(row['Material Cost %'] || row['materialCostPercent'] || 0),
            manufacturingCost: Number(row['Manufacturing Cost'] || row['manufacturingCost'] || 0),
            manufacturingCostPercent: Number(row['Manufacturing Cost %'] || row['manufacturingCostPercent'] || 0),
            toolingCost: Number(row['Tooling Cost'] || row['toolingCost'] || 0),
            toolingCostPercent: Number(row['Tooling Cost %'] || row['toolingCostPercent'] || 0),
            overheadProfit: Number(row['Overhead & Profit'] || row['overheadProfit'] || 0),
            overheadProfitPercent: Number(row['Overhead & Profit %'] || row['overheadProfitPercent'] || 0),
            packingCost: Number(row['Packing Cost'] || row['packingCost'] || 0),
            packingCostPercent: Number(row['Packing Cost %'] || row['packingCostPercent'] || 0),
            exwPartCost: Number(row['EX-W Part Cost'] || row['exwPartCost'] || 0),
            exwPartCostPercent: Number(row['EX-W Part Cost %'] || row['exwPartCostPercent'] || 0),
            freightCost: Number(row['Freight Cost'] || row['freightCost'] || 0),
            freightCostPercent: Number(row['Freight Cost %'] || row['freightCostPercent'] || 0),
            dutiesTariff: Number(row['Duties and Tariff'] || row['dutiesTariff'] || 0),
            dutiesTariffPercent: Number(row['Duties and Tariff %'] || row['dutiesTariffPercent'] || 0),
            partShouldCost: Number(row['Part Should Cost'] || row['partShouldCost'] || 0),
            partShouldCostPercent: Number(row['Part Should Cost %'] || row['partShouldCostPercent'] || 0)
        };
    }

    /**
     * Read all test data from Excel
     */
    readAllData(): MigWeldingExcelData {
        return {
            projectData: this.readProjectData(),
            partInformation: this.readPartInformation(),
            supplyTerms: this.readSupplyTerms(),
            materialInformation: this.readMaterialInformation(),
            partDetails: this.readPartDetails(),
            weldingDetails: this.readWeldingDetails(),
            machineDetails: this.readMachineDetails(),
            manufacturingDetails: this.readManufacturingDetails(),
            costSummary: this.readCostSummary()
        };
    }

    /**
     * Get list of all sheet names
     */
    getSheetNames(): string[] {
        return this.workbook.SheetNames;
    }
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Read MIG Welding test data from Excel file
 */
export function readMigWeldingTestData(filePath: string): MigWeldingExcelData {
    const reader = new MigWeldingExcelReader(filePath);
    return reader.readAllData();
}

/**
 * Get default Excel file path
 */
export function getDefaultExcelPath(): string {
    return path.resolve(__dirname, 'MigWelding-TestData.xlsx');
}
