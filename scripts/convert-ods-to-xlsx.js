/**
 * Script to convert OverheadProfitMaster.ods to XLSX format
 * This helps avoid the ERR_STRING_TOO_LONG error when parsing large ODS files
 * 
 * Usage: node scripts/convert-ods-to-xlsx.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '../tests/Database/OverheadProfitMaster.ods');
const outputFile = path.resolve(__dirname, '../tests/Database/OverheadProfitMaster.xlsx');

console.log('🔄 Converting ODS to XLSX format...');
console.log(`📂 Input: ${inputFile}`);
console.log(`📂 Output: ${outputFile}`);

try {
    // Read the ODS file with minimal options
    console.log('📖 Reading ODS file...');
    const workbook = XLSX.readFile(inputFile, {
        cellDates: true,
        cellStyles: false,
        bookVBA: false
    });

    console.log(`✅ Loaded ${workbook.SheetNames.length} sheets`);
    console.log(`📋 Sheets: ${workbook.SheetNames.join(', ')}`);

    // Write as XLSX
    console.log('💾 Writing XLSX file...');
    XLSX.writeFile(workbook, outputFile, {
        bookType: 'xlsx',
        compression: true
    });

    const stats = fs.statSync(outputFile);
    console.log(`✅ Conversion complete!`);
    console.log(`📦 Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

} catch (error) {
    console.error('❌ Conversion failed:', error.message);
    console.error('\n💡 Suggested solutions:');
    console.error('   1. The file may be too large for the xlsx library');
    console.error('   2. Try splitting the file into smaller files (one per sheet)');
    console.error('   3. Use LibreOffice to manually convert: File > Save As > Excel 2007-365 (.xlsx)');
    process.exit(1);
}
