import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
const workbook = XLSX.readFile(filePath, { sheetRows: 0 }); // Read ALL rows
const sheetName = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📊 MachineMaster Sheet: ${sheetName}`);
console.log(`📝 Total rows: ${data.length}`);

// Find rows with InjectionRate data
const rowsWithInjectionRate = data.filter((row: any) => row.InjectionRate && row.InjectionRate > 0);
console.log(`\n✅ Rows with InjectionRate > 0: ${rowsWithInjectionRate.length}`);

if (rowsWithInjectionRate.length > 0) {
    console.log(`\n📋 Sample rows with InjectionRate:`);
    rowsWithInjectionRate.slice(0, 10).forEach((row: any, index) => {
        console.log(`  ${index + 1}. MachineID: ${row.MachineID}, Tonnage: ${row.MachineTonnageTons}, InjectionRate: ${row.InjectionRate}, ShotSize: ${row.ShotSize}`);
    });
} else {
    console.log(`\n⚠️ No rows found with InjectionRate > 0`);
    console.log(`\n📋 Checking first 10 rows for InjectionRate values:`);
    data.slice(0, 10).forEach((row: any, index) => {
        console.log(`  ${index + 1}. MachineID: ${row.MachineID}, InjectionRate: ${row.InjectionRate}`);
    });
}

// Check for alternative column names
console.log(`\n🔍 Checking for alternative injection rate column names:`);
if (data.length > 0) {
    const firstRow = data[0] as any;
    Object.keys(firstRow).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('injection') && !lowerKey.includes('injectionrate')) {
            console.log(`  Found: "${key}" = ${firstRow[key]}`);
        }
    });
}
