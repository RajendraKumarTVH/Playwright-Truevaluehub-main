import * as XLSX from 'xlsx';
import * as path from 'path';

async function verifyInjectionRate() {
    const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
    const workbook = XLSX.readFile(filePath);
    const machineSheet = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase()));

    if (machineSheet) {
        const worksheet = workbook.Sheets[machineSheet];
        // Convert to array of arrays to get exact column positions
        // Column B (2nd column) is index 1
        // Column AF is index 31 (A=0, B=1, ... Z=25, AA=26, AB=27, AC=28, AD=29, AE=30, AF=31)
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        console.log(`Sheet: ${machineSheet}`);
        console.log(`Total rows: ${data.length}`);

        if (data.length > 0) {
            const headers = data[0];
            console.log(`Column B (index 1) Header: ${headers[1]}`);
            console.log(`Column AF (index 31) Header: ${headers[31]}`);

            // Sample some data
            console.log('\n--- Sample Data (Rows 2-6) ---');
            for (let i = 1; i < Math.min(6, data.length); i++) {
                console.log(`Row ${i + 1}: MachineName='${data[i][1]}', InjectionRate='${data[i][31]}'`);
            }
        }
    }
}

verifyInjectionRate().catch(console.error);
