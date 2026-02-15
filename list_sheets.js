
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    console.log('Sheet Names:', workbook.SheetNames);
} catch (error) {
    console.error('Error reading file:', error);
}
