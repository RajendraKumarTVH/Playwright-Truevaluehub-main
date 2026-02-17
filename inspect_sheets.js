const XLSX = require('xlsx');
const path = require('path');

const filePath = process.argv[2] || path.resolve(__dirname, 'tests/Database/OverheadProfitMaster.ods');
console.log('Reading file:', filePath);
try {
    const workbook = XLSX.readFile(filePath, { bookSheets: true });
    console.log('Sheet Names:', JSON.stringify(workbook.SheetNames, null, 2));
} catch (error) {
    console.error('Error reading file:', error);
}
