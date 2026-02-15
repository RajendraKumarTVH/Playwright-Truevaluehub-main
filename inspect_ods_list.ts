import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
const workbook = XLSX.readFile(filePath);
const sheetName = 'MachineMaster';
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

if (data.length > 0) {
    console.log('--- ALL COLUMNS ---');
    Object.keys(data[0] as object).forEach(k => console.log(k));
    console.log('-------------------');
}
