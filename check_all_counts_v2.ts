import * as XLSX from 'xlsx';
import * as path from 'path';

async function checkAllCounts() {
    const filePath = path.resolve(__dirname, 'test-data/MasterDB.ods');
    console.log('File:', filePath);
    const workbook = XLSX.readFile(filePath);
    console.log('Sheets found:', workbook.SheetNames.length);
    for (const name of workbook.SheetNames) {
        const worksheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        process.stdout.write(`SHEET_INFO: ${name} COUNT: ${data.length}\n`);
    }
}

checkAllCounts().catch(console.error);
