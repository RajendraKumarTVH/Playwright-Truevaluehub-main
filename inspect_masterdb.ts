
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';


const filePath = path.resolve(__dirname, 'test-data/MasterDB.ods');
const outputPath = path.resolve(__dirname, 'inspect_output.txt');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'materialmaster') || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    let output = `Reading: ${filePath}\nSheet: ${sheetName}\n`;

    if (data.length > 0) {
        output += '--- Columns ---\n';
        output += Object.keys(data[0]).join('\n') + '\n';

        const sample = data[0];
        const co2Keys = Object.keys(sample).filter(k => k.toLowerCase().includes('co2'));
        output += `\n--- Sample ESG data ---\n`;
        output += `EsgImpactCO2Kg: ${sample['EsgImpactCO2Kg']}\n`;
        output += `EsgImpactCO2KgScrap: ${sample['EsgImpactCO2KgScrap']}\n`;
        output += `CO2 related keys: ${JSON.stringify(co2Keys)}\n`;

        output += `\n--- First Row Full Data ---\n`;
        output += JSON.stringify(sample, null, 2);
    } else {
        output += `No data found in sheet: ${sheetName}\n`;
    }

    fs.writeFileSync(outputPath, output);
    console.log('Output written to inspect_output.txt');

} catch (error) {
    fs.writeFileSync(outputPath, `Error: ${error}`);
    console.error('Error written to inspect_output.txt');
}
