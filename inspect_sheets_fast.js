const XLSX = require('xlsx');
const path = require('path');

const filePath = process.argv[2] || path.resolve(__dirname, 'tests/Database/OverheadProfitMaster.ods');
console.log('Reading file:', filePath);
try {
    // Only read the workbook structure, not the sheets content
    const workbook = XLSX.readFile(filePath, { bookDeps: false, bookFiles: false, bookProps: false, bookSheets: true, bookVBA: false });
    console.log('Sheet Names Count:', workbook.SheetNames.length);
    console.log('Sheet Names:', JSON.stringify(workbook.SheetNames, null, 2));
} catch (error) {
    console.error('Error reading file:', error);
}
