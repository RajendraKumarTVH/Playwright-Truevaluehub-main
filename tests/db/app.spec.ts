import sql from 'mssql/msnodesqlv8'

const connectionString =
	'server=.;Database=jason;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}'
const query = 'SELECT TOP 10 * FROM MaterialMaster'

async function testConnection() {
	try {
		const pool = await sql.connect(connectionString)
		const result = await pool.request().query(query)
		console.log(result.recordset)
		await pool.close()
	} catch (err) {
		console.error('Database connection error:', err)
	}
}

testConnection()