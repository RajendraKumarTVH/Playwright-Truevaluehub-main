
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    const sheetName = 'PackingMaterialMaster';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    if (data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
        console.log('Values:', Object.values(data[0]));
    }
} catch (error) {
    console.error('Error reading file:', error);
}
