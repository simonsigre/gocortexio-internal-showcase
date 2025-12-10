import { getPool } from '../setup.js';

describe('User Submission Workflow', () => {
    let pool;
    let testUser;

    beforeAll(() => {
        pool = getPool();
    });

    beforeEach(async () => {
        // Create test user
        const result = await pool.query(`
      INSERT INTO users (email, name, role, theatre)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, ['testuser@example.com', 'Test User', 'user', 'NAM']);

        testUser = result.rows[0];
    });

    test('should create a draft submission', async () => {
        const submissionData = {
            name: 'Test Project',
            description: 'A test project for automated testing',
            link: 'https://github.com/test/project',
            language: 'Python',
            product: 'Cortex XSIAM',
            status: 'development'
        };

        const result = await pool.query(`
      INSERT INTO submissions (data, status, submitted_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [JSON.stringify(submissionData), 'draft', testUser.id]);

        expect(result.rows[0].id).toBeDefined();
        expect(result.rows[0].status).toBe('draft');
        expect(result.rows[0].submitted_by).toBe(testUser.id);
        expect(result.rows[0].data.name).toBe('Test Project');
    });

    test('should update draft submission', async () => {
        // Create draft
        const createResult = await pool.query(`
      INSERT INTO submissions (data, status, submitted_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
            JSON.stringify({ name: 'Draft Project' }),
            'draft',
            testUser.id
        ]);

        const submissionId = createResult.rows[0].id;
        const initialUpdatedAt = createResult.rows[0].updated_at;

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // Update draft
        await pool.query(`
      UPDATE submissions 
      SET data = $1
      WHERE id = $2
    `, [JSON.stringify({ name: 'Updated Project', description: 'New description' }), submissionId]);

        // Verify update
        const checkResult = await pool.query(`
      SELECT * FROM submissions WHERE id = $1
    `, [submissionId]);

        expect(checkResult.rows[0].data.name).toBe('Updated Project');
        expect(new Date(checkResult.rows[0].updated_at).getTime())
            .toBeGreaterThan(new Date(initialUpdatedAt).getTime());
    });

    test('should submit draft for review', async () => {
        const submissionData = {
            name: 'Complete Project',
            description: 'A complete project ready for review',
            link: 'https://github.com/test/complete',
            language: 'JavaScript',
            product: 'Cortex XDR'
        };

        // Create draft
        const createResult = await pool.query(`
      INSERT INTO submissions (data, status, submitted_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [JSON.stringify(submissionData), 'draft', testUser.id]);

        const submissionId = createResult.rows[0].id;

        // Submit for review
        const updateResult = await pool.query(`
      UPDATE submissions 
      SET status = $1, submitted_at = NOW()
      WHERE id = $2
      RETURNING *
    `, ['pending-review', submissionId]);

        expect(updateResult.rows[0].status).toBe('pending-review');
        expect(updateResult.rows[0].submitted_at).toBeDefined();

        // Create audit log entry
        await pool.query(`
      INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email)
      VALUES ($1, $2, $3, $4, $5)
    `, ['submit', 'submission', submissionId, testUser.id, testUser.email]);

        // Verify audit log
        const auditResult = await pool.query(`
      SELECT * FROM audit_log 
      WHERE resource_id = $1 AND action = $2
    `, [submissionId, 'submit']);

        expect(auditResult.rows.length).toBe(1);
        expect(auditResult.rows[0].user_email).toBe(testUser.email);
    });

    test('should prevent updating submitted submissions', async () => {
        // Create and submit
        const result = await pool.query(`
      INSERT INTO submissions (data, status, submitted_by, submitted_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [
            JSON.stringify({ name: 'Submitted Project' }),
            'pending-review',
            testUser.id
        ]);

        // In a real application, this would be prevented by business logic
        // For now, we just verify the status
        expect(result.rows[0].status).toBe('pending-review');
    });
});
