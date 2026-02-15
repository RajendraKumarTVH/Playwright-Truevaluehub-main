
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    const sheetName = 'PackingMaterialMaster';
    const worksheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    console.log(`Headers for '${sheetName}':`, headers.join(', '));
} catch (error) {
    console.error('Error reading file:', error);
}
