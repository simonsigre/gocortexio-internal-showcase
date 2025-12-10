import { getPool } from '../setup.js';

describe('Database Schema Validation', () => {
    let pool;

    beforeAll(() => {
        pool = getPool();
    });

    test('should have all required tables', async () => {
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        const tables = result.rows.map(r => r.table_name);

        expect(tables).toContain('users');
        expect(tables).toContain('projects');
        expect(tables).toContain('submissions');
        expect(tables).toContain('incubation_projects');
        expect(tables).toContain('audit_log');
        expect(tables).toContain('uploaded_files');
    });

    test('users table should have correct structure', async () => {
        const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

        const columns = result.rows.reduce((acc, row) => {
            acc[row.column_name] = {
                type: row.data_type,
                nullable: row.is_nullable === 'YES'
            };
            return acc;
        }, {});

        // Required columns
        expect(columns.id).toBeDefined();
        expect(columns.email).toBeDefined();
        expect(columns.email.nullable).toBe(false);
        expect(columns.name).toBeDefined();
        expect(columns.name.nullable).toBe(false);
        expect(columns.role).toBeDefined();
        expect(columns.role.nullable).toBe(false);
    });

    test('projects table should have correct indexes', async () => {
        const result = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'projects'
    `);

        const indexes = result.rows.map(r => r.indexname);

        expect(indexes).toContain('idx_projects_status');
        expect(indexes).toContain('idx_projects_product');
        expect(indexes).toContain('idx_projects_submitted_by');
        expect(indexes).toContain('idx_projects_tags');
    });

    test('should enforce unique constraints', async () => {
        // Insert user
        await pool.query(`
      INSERT INTO users (email, name, role)
      VALUES ('test@example.com', 'Test User', 'user')
    `);

        // Try to insert duplicate email
        await expect(
            pool.query(`
        INSERT INTO users (email, name, role)
        VALUES ('test@example.com', 'Another User', 'user')
      `)
        ).rejects.toThrow();
    });

    test('should enforce foreign key constraints', async () => {
        // Try to insert project with non-existent user
        await expect(
            pool.query(`
        INSERT INTO projects (
          name, description, link, language, product, status, submitted_by
        )
        VALUES (
          'Test Project', 'Description', 'https://test.com',
          'Python', 'Cortex XSIAM', 'draft',
          '00000000-0000-0000-0000-000000000099'
        )
      `)
        ).rejects.toThrow();
    });

    test('should have updated_at trigger working', async () => {
        // Create user
        const userResult = await pool.query(`
      INSERT INTO users (email, name, role)
      VALUES ('trigger@test.com', 'Trigger Test', 'user')
      RETURNING id, created_at, updated_at
    `);

        const userId = userResult.rows[0].id;
        const initialUpdatedAt = userResult.rows[0].updated_at;

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // Update user
        await pool.query(`
      UPDATE users SET name = 'Updated Name' WHERE id = $1
    `, [userId]);

        // Check updated_at changed
        const checkResult = await pool.query(`
      SELECT updated_at FROM users WHERE id = $1
    `, [userId]);

        expect(new Date(checkResult.rows[0].updated_at).getTime())
            .toBeGreaterThan(new Date(initialUpdatedAt).getTime());
    });
});
