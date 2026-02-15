
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 50 }); // Read more rows
    const sheetName = 'PackingMaterialMaster';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Print first 2 valid items
    console.log(JSON.stringify(data.slice(0, 2), null, 2));
} catch (error) {
    console.error('Error reading file:', error);
}
