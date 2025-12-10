import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'postgresql://arsenal_user:dev_password_change_in_prod@localhost:5432/cortex_arsenal';

let pool;

export async function setupTestDatabase() {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });

    console.log('🔧 Setting up test database...');

    // Clean existing data
    await cleanDatabase();

    console.log('✅ Test database ready');

    return pool;
}

export async function cleanDatabase() {
    try {
        await pool.query('TRUNCATE users, projects, submissions, incubation_projects, audit_log, uploaded_files RESTART IDENTITY CASCADE');
    } catch (error) {
        console.warn('⚠️  Warning during database cleanup:', error.message);
    }
}

export async function teardownTestDatabase() {
    if (pool) {
        await pool.end();
    }
}

export function getPool() {
    return pool;
}

// Global setup
beforeAll(async () => {
    await setupTestDatabase();
});

// Clean between tests
beforeEach(async () => {
    await cleanDatabase();
});

// Global teardown
afterAll(async () => {
    await teardownTestDatabase();
});
