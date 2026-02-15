import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve(__dirname, '../Database/MaterialMaster.ods');
const outputPath = path.resolve(__dirname, '../Database/material_master_inspection.txt');

console.log('Reading file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let output = '';
    output += `Total rows: ${data.length}\n\n`;

    if (data.length > 0) {
        output += 'Column names:\n';
        const firstRow = data[0] as any;
        Object.keys(firstRow).forEach((key, index) => {
            output += `  ${index + 1}. ${key}\n`;
        });

        output += '\nSample data (first 5 rows):\n';
        data.slice(0, 5).forEach((row: any, index) => {
            output += `\n--- Row ${index + 1} ---\n`;
            output += `MaterialType: ${row.MaterialType}\n`;
            output += `Density: ${row.Density}\n`;
            output += `ThermalDiffusivity: ${row.ThermalDiffusivity}\n`;
            output += `ThermalConductivity: ${row.ThermalConductivity}\n`;
            output += `MaterialSpecificHeat: ${row.MaterialSpecificHeat}\n`;
            output += `InjectionRate: ${row.InjectionRate}\n`;
            output += `MeltingTemp: ${row.MeltingTemp}\n`;
            output += `MoldTemp: ${row.MoldTemp}\n`;
        });

        // Check for materials with ThermalDiffusivity
        const withTD = data.filter((row: any) => row.ThermalDiffusivity && row.ThermalDiffusivity > 0);
        output += `\n\nMaterials with ThermalDiffusivity > 0: ${withTD.length}\n`;

        if (withTD.length > 0) {
            output += '\nFirst 10 materials with ThermalDiffusivity:\n';
            withTD.slice(0, 10).forEach((row: any) => {
                output += `  - ${row.MaterialType}: ${row.ThermalDiffusivity}\n`;
            });
        }

        // Check for materials WITHOUT ThermalDiffusivity
        const withoutTD = data.filter((row: any) => !row.ThermalDiffusivity || row.ThermalDiffusivity === 0);
        output += `\nMaterials WITHOUT ThermalDiffusivity: ${withoutTD.length}\n`;
        if (withoutTD.length > 0) {
            output += '\nFirst 10 materials WITHOUT ThermalDiffusivity:\n';
            withoutTD.slice(0, 10).forEach((row: any) => {
                output += `  - ${row.MaterialType}\n`;
            });
        }
    }

    fs.writeFileSync(outputPath, output);
    console.log(`\n✅ Inspection complete! Results written to:\n${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`- Total materials: ${data.length}`);
    const withTD = data.filter((row: any) => row.ThermalDiffusivity && row.ThermalDiffusivity > 0);
    console.log(`- With ThermalDiffusivity: ${withTD.length}`);
    console.log(`- Without ThermalDiffusivity: ${data.length - withTD.length}`);
} catch (error) {
    console.error('Error:', error);
}
