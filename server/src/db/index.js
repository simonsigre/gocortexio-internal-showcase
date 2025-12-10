import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Database connected');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});

// Query helper with logging
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', { text, error: error.message });
        throw error;
    }
}

// Transaction helper
export async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export default pool;
