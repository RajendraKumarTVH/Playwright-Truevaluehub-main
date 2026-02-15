import * as XLSX from 'xlsx';
import * as path from 'path';

async function checkAllCounts() {
    const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
    const workbook = XLSX.readFile(filePath);
    workbook.SheetNames.forEach(name => {
        const worksheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`Sheet: ${name}, Rows: ${data.length}`);
    });
}

checkAllCounts().catch(console.error);
