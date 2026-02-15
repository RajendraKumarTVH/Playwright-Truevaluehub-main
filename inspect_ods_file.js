const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

if (data.length > 0) {
    const cols = Object.keys(data[0]);
    fs.writeFileSync('ods_cols.txt', cols.join('\n'));
}
