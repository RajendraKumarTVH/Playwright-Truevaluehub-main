/**
 * Script to create MIG Welding Test Data Excel file
 * Run this script to generate the Excel test data file
 * 
 * Usage: npx ts-node test-data/create-excel-testdata.ts
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

// ==================== TEST DATA ====================
const projectData = [
    {
        'Project ID': '14783',
        'Project Name': 'TVH_21 14783',
        'Target Month': 'December 2025',
        'Created By': 'Rajendra Kumar',
        'Status': 'Costing'
    }
];

const partInformation = [
    {
        'Internal Part Number': '1023729-C-1023729-C 3',
        'Drawing Number': '',
        'Revision Number': '',
        'Part Description': '',
        'Manufacturing Category': 'Sheet Metal and Fabrication',
        'BOM Qty': 1,
        'Annual Volume Qty': 950,
        'Lot Size': 79,
        'Product Life Remaining': 5,
        'Life Time Qty Remaining': 4750
    }
];

const supplyTerms = [
    {
        'Supplier Name': 'Target Vendor -  United States',
        'Manufacturing City': 'New York',
        'Manufacturing Country': 'USA',
        'Delivery Site Name': 'Santino Steel - India - Bengaluru',
        'Delivery City': 'Bengaluru',
        'Delivery Country': 'India'
    }
];

const materialInformation = [
    {
        'Process Group': 'Mig Welding',
        'Category': 'Ferrous',
        'Family': 'Carbon Steel',
        'Description/Grade': 'AISI 1050 | DIN CF53 | EN43C | SWRH52B/S50C',
        'Stock Form': 'Plate',
        'Scrap Price': 0.3732,
        'Material Price': 3.08,
        'Volume Purchased': 0,
        'Volume Discount': 0,
        'Discounted Material Price': 3.08
    }
];

const partDetails = [
    {
        'Part Envelope Length': 27,
        'Part Envelope Width': 20,
        'Part Envelope Height': 5,
        'Net Weight': 5.6713,
        'Part Surface Area': 1166.6708,
        'Part Volume': 720.6173
    }
];

const weldingDetails = [
    {
        'Weld Number': 1,
        'Weld Type': 'Fillet',
        'Weld Size': 6,
        'Wire Dia': 1.2,
        'Weld Element Size': 6,
        'No. of Weld Passes': 1,
        'Weld Length': 80,
        'Weld Side': 'Both',
        'Weld Places': 1,
        'Grind Flush': 'No',
        'Weld Position': 'Flat',
        'Travel Speed': 3.825,
        'Tack Welds': 1,
        'Intermediate Stops': 2,
        'Weld Cycle Time': 54.8301
    },
    {
        'Weld Number': 2,
        'Weld Type': 'Fillet',
        'Weld Size': 6,
        'Wire Dia': 1.2,
        'Weld Element Size': 6,
        'No. of Weld Passes': 1,
        'Weld Length': 30,
        'Weld Side': 'Single',
        'Weld Places': 1,
        'Grind Flush': 'No',
        'Weld Position': 'Flat',
        'Travel Speed': 3.825,
        'Tack Welds': 1,
        'Intermediate Stops': 1,
        'Weld Cycle Time': 15.8431
    }
];

const machineDetails = [
    {
        'Process Group': 'Mig Welding',
        'Min. Current Required': 400,
        'Min. Welding Voltage': 35,
        'Selected Current': 240,
        'Selected Voltage': 0,
        'Machine Name': 'MIG Welding (Manual) - C240',
        'Machine Description': 'C240 (ESAB- 20A to 240A)',
        'M/c Automation': 'Manual',
        'Sampling Plan': 'Level1',
        'Machine Efficiency': 70,
        'Machine Hour Rate': 3.8548,
        'Net Process Cost': 2.1406
    }
];

const manufacturingDetails = [
    {
        'Loading/Unloading Time': 20,
        'Part Reorientation': 0,
        'Total Weld Cycle Time': 95.2069,
        'Sampling Rate': 5,
        'Yield Percentage': 97,
        'Yield Cost/Part': 0.0635,
        'Direct Labor Rate': 42.7557,
        '# of Direct Labors': 1,
        'Labor Cost/Part': 1.6153,
        'Set-up Labor Rate': 34.1925,
        'Machine Setup Time': 30,
        'Setup Cost/Part': 0.2408,
        'QA Inspector Rate': 29.9182,
        'QA Inspection Time': 2,
        'QA Inspection Cost/Part': 0.0008,
        'Cycle Time/Part': 136.0098,
        'Machine Cost/Part': 0.1456,
        'Power Unit Cost': 0.141,
        'Power Consumption': 14,
        'Total Power Cost': 0.0746
    }
];

const costSummary = [
    {
        'Material Cost': 0.1127,
        'Material Cost %': 4.03,
        'Manufacturing Cost': 2.1406,
        'Manufacturing Cost %': 76.56,
        'Tooling Cost': 0,
        'Tooling Cost %': 0,
        'Overhead & Profit': 0.5406,
        'Overhead & Profit %': 19.34,
        'Packing Cost': 0.0019,
        'Packing Cost %': 0.07,
        'EX-W Part Cost': 2.7958,
        'EX-W Part Cost %': 100.00,
        'Freight Cost': 0,
        'Freight Cost %': 0,
        'Duties and Tariff': 0,
        'Duties and Tariff %': 0,
        'Part Should Cost': 2.7958,
        'Part Should Cost %': 100.00
    }
];

const sustainability = [
    {
        'CO2 (kg)/kg - Material': 13.7958,
        'CO2 (kg)/Scrap': 13.7958,
        'CO2 (kg)/part - Material': 0.3713,
        'CO2 (kg)/kw-Hr': 1.7317,
        'CO2 (kg)/part - Manufacturing': 0.0119
    }
];

const expectedValues = [
    {
        'Total Weld Length': 190,
        'Total Cycle Time': 136.0098,
        'Net Process Cost': 2.1406,
        'Total Should Cost': 2.7958,
        'Tolerance': 0.01
    }
];

// ==================== CREATE WORKBOOK ====================
function createExcelFile() {
    const workbook = XLSX.utils.book_new();

    // Add sheets
    const wsProjectData = XLSX.utils.json_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, wsProjectData, 'ProjectData');

    const wsPartInfo = XLSX.utils.json_to_sheet(partInformation);
    XLSX.utils.book_append_sheet(workbook, wsPartInfo, 'PartInformation');

    const wsSupplyTerms = XLSX.utils.json_to_sheet(supplyTerms);
    XLSX.utils.book_append_sheet(workbook, wsSupplyTerms, 'SupplyTerms');

    const wsMaterialInfo = XLSX.utils.json_to_sheet(materialInformation);
    XLSX.utils.book_append_sheet(workbook, wsMaterialInfo, 'MaterialInformation');

    const wsPartDetails = XLSX.utils.json_to_sheet(partDetails);
    XLSX.utils.book_append_sheet(workbook, wsPartDetails, 'PartDetails');

    const wsWeldingDetails = XLSX.utils.json_to_sheet(weldingDetails);
    XLSX.utils.book_append_sheet(workbook, wsWeldingDetails, 'WeldingDetails');

    const wsMachineDetails = XLSX.utils.json_to_sheet(machineDetails);
    XLSX.utils.book_append_sheet(workbook, wsMachineDetails, 'MachineDetails');

    const wsManufacturingDetails = XLSX.utils.json_to_sheet(manufacturingDetails);
    XLSX.utils.book_append_sheet(workbook, wsManufacturingDetails, 'ManufacturingDetails');

    const wsCostSummary = XLSX.utils.json_to_sheet(costSummary);
    XLSX.utils.book_append_sheet(workbook, wsCostSummary, 'CostSummary');

    const wsSustainability = XLSX.utils.json_to_sheet(sustainability);
    XLSX.utils.book_append_sheet(workbook, wsSustainability, 'Sustainability');

    const wsExpectedValues = XLSX.utils.json_to_sheet(expectedValues);
    XLSX.utils.book_append_sheet(workbook, wsExpectedValues, 'ExpectedValues');

    // Write file
    const outputPath = path.resolve(__dirname, 'MigWelding-TestData.xlsx');
    XLSX.writeFile(workbook, outputPath);

    console.log(`✅ Excel test data file created: ${outputPath}`);
    console.log('\nSheets created:');
    workbook.SheetNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
    });
}

// Run the script
createExcelFile();
