const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/OverheadProfitMaster.ods');
console.log('Testing sheet names in:', filePath);

const sheetNamesToTry = [
    'MedbPackingMaterialMaster',
    'MedbPackagingSizeDefinition',
    'MedbLogisticsRateCard',
    'MedbContainerSize',
    'MedbRateCard',
    'PackingMaterialMaster',
    'PackagingSizeDefinition',
    'LogisticsRateCard',
    'MedbContainerSizeMaster'
];

try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 1 });
    const found = sheetNamesToTry.filter(s => workbook.SheetNames.includes(s));
    console.log('Matched sheet names:', found);

    // Also log all sheets if possible (truncate if too many)
    console.log('All sheet names (first 50):', workbook.SheetNames.slice(0, 50));
} catch (error) {
    console.error('Error:', error);
}
