import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve(__dirname, 'tests/Database/MaterialMaster.ods');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet) as any[];

console.log('Columns:', Object.keys(data[0] || {}));
