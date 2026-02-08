import { test, expect } from '@playwright/test';
import { getDbPool } from '../../utils/dbClient';

test('DB connection should work', async () => {
    const pool = await getDbPool();

    const result = await pool.request().query('SELECT 1 AS ok');

    expect(result.recordset[0].ok).toBe(1);
});
