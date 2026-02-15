import * as XLSX from 'xlsx';
import * as path from 'path';

async function inspectMachineMaster() {
    const filePath = path.resolve(__dirname, 'test-data/MasterDB.ods');
    const workbook = XLSX.readFile(filePath, { sheetRows: 10000 });
    const machineSheet = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[machineSheet];
    console.log(`Worksheet range: ${worksheet['!ref']}`);
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    console.log(`Sheet: ${machineSheet}`);
    console.log(`Total rows: ${data.length}`);
    if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    }
}

inspectMachineMaster().catch(console.error);
