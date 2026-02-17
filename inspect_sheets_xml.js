const fs = require('fs');
const path = require('path');
const admZip = require('adm-zip');

const filePath = path.resolve(__dirname, 'tests/Database/OverheadProfitMaster.ods');
console.log('Reading file structure:', filePath);

try {
    const zip = new admZip(filePath);
    const contentEntry = zip.getEntry('content.xml');
    if (contentEntry) {
        const content = contentEntry.getData().toString('utf8');
        // Simple regex to find <table:table table:name="SheetName">
        const sheetNames = [];
        const regex = /<table:table table:name="([^"]+)"/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            sheetNames.push(match[1]);
        }
        console.log('Sheet Names found via XML:', JSON.stringify(sheetNames, null, 2));
    } else {
        console.log('content.xml not found in ODS');
    }
} catch (error) {
    console.error('Error reading ZIP structure:', error);
}
