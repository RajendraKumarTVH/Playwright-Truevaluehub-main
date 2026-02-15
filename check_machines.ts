import * as XLSX from 'xlsx';
import * as path from 'path';

async function checkMachineMaster() {
    const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
    console.log(`Checking file: ${filePath}`);

    // Test with sheetRows: 0
    const wb0 = XLSX.readFile(filePath, { sheetRows: 0 });
    const machineSheet0 = wb0.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || wb0.SheetNames[0];
    const ws0 = wb0.Sheets[machineSheet0];
    const data0 = XLSX.utils.sheet_to_json(ws0);
    console.log(`1. With sheetRows 0 - Sheet: ${machineSheet0}, Total: ${data0.length}`);

    // Test without sheetRows
    const wbFull = XLSX.readFile(filePath);
    const machineSheetFull = wbFull.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase())) || wbFull.SheetNames[0];
    const wsFull = wbFull.Sheets[machineSheetFull];
    const dataFull = XLSX.utils.sheet_to_json(wsFull);
    console.log(`2. Without sheetRows - Sheet: ${machineSheetFull}, Total: ${dataFull.length}`);

    if (dataFull.length > 0) {
        console.log('Sample data keys:', Object.keys(dataFull[0] as object));
        console.log('Sample machine name:', (dataFull[0] as any).MachineName);
    }
}

checkMachineMaster().catch(console.error);
