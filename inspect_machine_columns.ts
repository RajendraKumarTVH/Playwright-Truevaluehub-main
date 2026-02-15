import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
const workbook = XLSX.readFile(filePath, { sheetRows: 10 }); // Read first 10 rows to inspect
const sheetName = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📊 MachineMaster Sheet: ${sheetName}`);
console.log(`📝 Total rows loaded: ${data.length}`);

if (data.length > 0) {
    console.log(`\n🔑 Column Names (from first row):`);
    const firstRow = data[0] as any;
    Object.keys(firstRow).forEach((key, index) => {
        console.log(`  ${index + 1}. "${key}" = ${firstRow[key]}`);
    });

    // Check for injection rate related columns
    console.log(`\n🔍 Searching for Injection Rate columns:`);
    Object.keys(firstRow).forEach(key => {
        if (key.toLowerCase().includes('injection') || key.toLowerCase().includes('rate')) {
            console.log(`  ✅ Found: "${key}" = ${firstRow[key]}`);
        }
    });
}
