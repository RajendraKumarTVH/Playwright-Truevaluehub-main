import * as XLSX from 'xlsx';
import * as path from 'path';

async function checkRange() {
    const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
    const workbook = XLSX.readFile(filePath);
    const machineSheet = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase()));
    if (machineSheet) {
        const worksheet = workbook.Sheets[machineSheet];
        console.log(`Sheet: ${machineSheet}`);
        console.log(`Range: ${worksheet['!ref']}`);

        // Convert to array of arrays to see raw data count
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Row count (including headers): ${data.length}`);

        // Look at the last row
        if (data.length > 0) {
            console.log('Last row sample:', data[data.length - 1]);
        }
    }
}

checkRange().catch(console.error);
