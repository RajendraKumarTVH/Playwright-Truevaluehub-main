
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    const sheetName = 'PackingMtlTbl';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log('PackingMtlTbl Data:', JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error reading file:', error);
}
