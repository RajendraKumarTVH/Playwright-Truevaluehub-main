import * as XLSX from 'xlsx';
import * as path from 'path';

async function inspectColumns() {
    const filePath = path.resolve(__dirname, 'tests/Database/MasterDB.ods');
    const workbook = XLSX.readFile(filePath);
    const machineSheet = workbook.SheetNames.find(s => ['machinemaster', 'machinemater'].includes(s.toLowerCase()));
    if (machineSheet) {
        const worksheet = workbook.Sheets[machineSheet];
        const data = XLSX.utils.sheet_to_json(worksheet);
        if (data.length > 0) {
            console.log('--- MACHINE MASTER COLUMNS ---');
            const keys = Object.keys(data[0] as any);
            keys.forEach(k => console.log(k));
            console.log('-------------------------------');

            // Search for InjectionRate specifically
            const injectionKey = keys.find(k => k.toLowerCase().includes('injection'));
            if (injectionKey) {
                console.log(`Found injection related column: ${injectionKey}`);
            } else {
                console.log('No injection related column found in first row.');
                // Check all keys in first 100 rows just in case
                const allKeys = new Set<string>();
                data.slice(0, 100).forEach(row => {
                    Object.keys(row as any).forEach(k => allKeys.add(k));
                });
                console.log('All keys found in first 100 rows:');
                Array.from(allKeys).forEach(k => {
                    if (k.toLowerCase().includes('injection') || k.toLowerCase().includes('rate')) {
                        console.log(`Potential match: ${k}`);
                    }
                });
            }
        }
    }
}

inspectColumns().catch(console.error);
