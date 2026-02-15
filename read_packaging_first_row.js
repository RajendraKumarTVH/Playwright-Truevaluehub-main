
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    const sheetName = 'PackingMaterialMaster';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    if (data.length > 0) {
        console.log('First row data:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data found in sheet');
    }
} catch (error) {
    console.error('Error reading file:', error);
}
