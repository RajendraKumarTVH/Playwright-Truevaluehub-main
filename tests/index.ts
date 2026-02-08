import SQLHelper from './utils/SQLHelper';
import sql from 'mssql';

async function testSQL() {
    try {
        // Example 1: simple query
        const employees = await SQLHelper.query('SELECT TOP 5 * FROM tblMaterialMaster');
        console.log('Employees:', employees);

        // Example 2: parameterized query
        const employee = await SQLHelper.query(
            'SELECT * FROM tblMaterialMaster WHERE MaterialName = @id',
            { id: { type: sql.NVarChar, value: 'Steel Sheet' } }
        );
        console.log('Employee with MaterialName 1:', employee);

    } catch (err) {
        console.error(err);
    } finally {
        // Close pool when done
        await SQLHelper.close();
    }
}

testSQL();
