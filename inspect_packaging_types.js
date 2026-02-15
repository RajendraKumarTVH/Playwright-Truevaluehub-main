
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
try {
    const workbook = XLSX.readFile(filePath, { sheetRows: 0 });
    const sheetName = 'PackingMaterialMaster';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Group by PackagingFormId or inspect relevant field
    const uniqueTypes = [...new Set(data.map(item => item.PackagingFormId))];
    console.log('Unique PackagingFormId:', uniqueTypes);

    // Check PackingType if available
    if (data[0].PackingType) {
        const uniquePackingTypes = [...new Set(data.map(item => item.PackingType))];
        console.log('Unique PackingType:', uniquePackingTypes);
    }
} catch (error) {
    console.error('Error reading file:', error);
}
