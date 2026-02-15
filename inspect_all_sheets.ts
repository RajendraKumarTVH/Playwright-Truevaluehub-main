import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
const workbook = XLSX.readFile(filePath, { sheetRows: 0 });

console.log(`\n📚 Available Sheets in MasterDB.ods:`);
workbook.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
});

// Check MaterialMaster for InjectionRate
const materialSheet = workbook.SheetNames.find(s => s.toLowerCase() === 'materialmaster');
if (materialSheet) {
    const worksheet = workbook.Sheets[materialSheet];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`\n📊 MaterialMaster Sheet:`);
    console.log(`📝 Total rows: ${data.length}`);

    if (data.length > 0) {
        const firstRow = data[0] as any;
        console.log(`\n🔑 Columns with 'Injection' or 'Rate':`);
        Object.keys(firstRow).forEach(key => {
            if (key.toLowerCase().includes('injection') || key.toLowerCase().includes('rate')) {
                console.log(`  ✅ "${key}"`);
            }
        });

        // Check for InjectionRate data
        const rowsWithInjectionRate = data.filter((row: any) => row.InjectionRate && row.InjectionRate > 0);
        console.log(`\n✅ Rows with InjectionRate > 0: ${rowsWithInjectionRate.length}`);

        if (rowsWithInjectionRate.length > 0) {
            console.log(`\n📋 Sample materials with InjectionRate:`);
            rowsWithInjectionRate.slice(0, 5).forEach((row: any, index) => {
                console.log(`  ${index + 1}. Material: ${row.MaterialType}, InjectionRate: ${row.InjectionRate}`);
            });
        }
    }
}
