import sql from 'mssql'
import { testConfig } from '../testConfig'

let config: sql.config = {
	user: testConfig.dbUsername || 'sa',
	password: testConfig.dbPassword || '123456',
	server: testConfig.dbServerName || 'localhost',
	database: testConfig.dbName || 'TruevalueHub',
	port: testConfig.dbPort ? parseInt(testConfig.dbPort) : undefined,
	options: {
		encrypt: true,
		trustServerCertificate: true
	}
}

export function setSqlConfig(newConfig: sql.config) {
	config = { ...config, ...newConfig }
}

export async function queryDatabase(query: string) {
	try {
		const pool = await sql.connect(config)
		const result = await pool.request().query(query)
		await pool.close()
		return result.recordset
	} catch (error) {
		console.error('DB Query Error:', error)
		throw error
	}
}

export default { setSqlConfig, queryDatabase }
