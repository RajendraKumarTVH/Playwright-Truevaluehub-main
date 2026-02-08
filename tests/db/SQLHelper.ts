import sql from 'mssql';

let pool: sql.ConnectionPool | null = null;

export async function getDbPool() {
	if (!pool) {
		pool = await new sql.ConnectionPool({
			server: process.env.DB_HOST!,
			database: process.env.DB_NAME!,
			user: process.env.DB_USER!,
			password: process.env.DB_PASSWORD!,
			options: {
				encrypt: true,
				trustServerCertificate: false
			}
		}).connect();
	}
	return pool;
}

export async function closeDb() {
	if (pool) {
		await pool.close();
		pool = null;
	}
}
