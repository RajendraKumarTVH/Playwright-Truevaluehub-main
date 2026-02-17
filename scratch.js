const ExcelJS = require('exceljs');
const path = require('path');

async function inspect() {
    const filePath = path.resolve(__dirname, 'tests/Database/OverheadProfitMaster.ods');
    console.log('Reading file with ExcelJS:', filePath);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.calculateSheetNames(filePath); // This is not a real method, wait.
        // ExcelJS read method for ODS might not be simple.
        // Actually ExcelJS supports XLSX. For ODS, we use XLSX.
    } catch (e) {
        console.error(e);
    }
}
// wait, ExcelJS doesn't support ODS well.
