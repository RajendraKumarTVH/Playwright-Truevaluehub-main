// tests/db-verify-azurecli-sso.test.ts
import { test } from '@playwright/test'
import * as sql from 'mssql'
import { AzureCliCredential } from '@azure/identity'
import 'dotenv/config'

test('DB Connection Test (Azure CLI SSO)', async () => {
	const server = process.env.DB_SERVER || 'tvh-sql-dev.database.windows.net'
	const database = process.env.DB_NAME || 'truevaluehub-qa-master'
	const port = Number(process.env.DB_PORT) || 1433

	console.log('Starting DB connection test using Azure CLI SSO...')
	console.log(`Server: ${server}`)
	console.log(`Database: ${database}`)
	console.log(`Port: ${port}`)

	const credential = new AzureCliCredential()

	try {
		// Acquire access token from Azure CLI login
		const accessToken = await credential.getToken(
			'https://database.windows.net/.default'
		)
		if (!accessToken) throw new Error('Failed to acquire Azure AD access token')

		const config: sql.config = {
			server,
			database,
			port,
			options: {
				encrypt: true,
				trustServerCertificate: true
			},
			authentication: {
				type: 'azure-active-directory-access-token',
				options: {
					token: accessToken.token
				}
			}
		}

		const pool = await sql.connect(config)
		console.log('✅ SSO Connection successful!')

		const marketResult = await pool
			.request()
			.query('SELECT TOP 1 * FROM MaterialMarket')
		console.log(
			'MaterialMarket Columns:',
			Object.keys(marketResult.recordset[0])
		)

		const masterResult = await pool
			.request()
			.query('SELECT TOP 1 * FROM MaterialMaster')
		console.log(
			'MaterialMaster Columns:',
			Object.keys(masterResult.recordset[0])
		)

		await pool.close()
		console.log('Connection closed.')
	} catch (err: unknown) {
		const error = err as { code?: string; message?: string }
		console.error('❌ SSO Connection failed:', error.message || err)
		throw err // fail the Playwright test
	}
})
