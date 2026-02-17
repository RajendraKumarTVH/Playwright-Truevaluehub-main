const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'PackagingSizeDefinition';
    if (workbook.Sheets[sheetName]) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log('Data from PackagingSizeDefinition:', JSON.stringify(data.slice(0, 10), null, 2));
    } else {
        console.log('Sheet not found:', sheetName);
    }
} catch (error) {
    console.error('Error reading file:', error);
}
