import * as XLSX from 'xlsx';
import * as path from 'path';

async function compareFiles() {
    const files = [
        'test-data/MasterDB.ods',
        'tests/Database/MasterDB.ods'
    ];

    for (const file of files) {
        const filePath = path.resolve(__dirname, file);
        try {
            const workbook = XLSX.readFile(filePath);
            const machineSheet = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase()));
            if (machineSheet) {
                const worksheet = workbook.Sheets[machineSheet];
                const data = XLSX.utils.sheet_to_json(worksheet);
                console.log(`File: ${file} - Sheet: ${machineSheet} - Rows: ${data.length}`);
            } else {
                console.log(`File: ${file} - MachineMaster sheet not found. Sheets: ${workbook.SheetNames.join(', ')}`);
            }
        } catch (e) {
            console.log(`Error reading ${file}: ${e}`);
        }
    }
}

compareFiles().catch(console.error);
