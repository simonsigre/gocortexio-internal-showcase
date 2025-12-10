import express from 'express';
import { query, transaction } from '../db/index.js';

const router = express.Router();

// GET /api/submissions - Get all submissions (admin only)
router.get('/', async (req, res, next) => {
    try {
        const { status } = req.query;

        let sql = `
      SELECT s.*, u.name as submitted_by_name, u.email as submitted_by_email
      FROM submissions s
      JOIN users u ON s.submitted_by = u.id
    `;

        const params = [];

        if (status) {
            params.push(status);
            sql += ` WHERE s.status = $${params.length}`;
        }

        sql += ' ORDER BY s.submitted_at DESC NULLS LAST, s.created_at DESC';

        const result = await query(sql, params);
        res.json({ submissions: result.rows, total: result.rowCount });
    } catch (error) {
        next(error);
    }
});

// POST /api/submissions/:id/approve - Approve submission and create project
router.post('/:id/approve', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { publish_immediately = true } = req.body;

        // TODO: Get admin user from JWT
        const adminUserId = '00000000-0000-0000-0000-000000000001';

        const result = await transaction(async (client) => {
            // Get submission data
            const submissionResult = await client.query(
                'SELECT * FROM submissions WHERE id = $1',
                [id]
            );

            if (submissionResult.rows.length === 0) {
                throw new Error('Submission not found');
            }

            const submission = submissionResult.rows[0];
            const projectData = submission.data;

            // Create project from submission
            const projectResult = await client.query(`
        INSERT INTO projects (
          name, description, link, repo, product, theatre, usecase, language,
          status, submitted_by, reviewed_by, tags, technical_stack, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, ${publish_immediately ? 'NOW()' : 'NULL'})
        RETURNING *
      `, [
                projectData.name,
                projectData.description,
                projectData.link,
                projectData.repo,
                projectData.product,
                projectData.theatre,
                projectData.usecase,
                projectData.language,
                publish_immediately ? 'published' : 'draft',
                submission.submitted_by,
                adminUserId,
                projectData.tags || [],
                projectData.technical_stack || []
            ]);

            // Update submission status
            await client.query(`
        UPDATE submissions 
        SET status = $1, reviewed_by = $2, reviewed_at = NOW()
        WHERE id = $3
      `, ['approved', adminUserId, id]);

            // Create audit log entry
            await client.query(`
        INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'approve_submission',
                'submission',
                id,
                adminUserId,
                'admin@example.com', // TODO: Get from JWT
                JSON.stringify({ project_id: projectResult.rows[0].id, published: publish_immediately })
            ]);

            return { project: projectResult.rows[0], submission: submission };
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/submissions/:id/reject - Reject submission
router.post('/:id/reject', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, notes } = req.body;

        const adminUserId = '00000000-0000-0000-0000-000000000001';

        const result = await transaction(async (client) => {
            await client.query(`
        UPDATE submissions 
        SET status = $1, reviewed_by = $2, reviewed_at = NOW(), 
            rejection_reason = $3, review_notes = $4
        WHERE id = $5
      `, ['rejected', adminUserId, reason, notes, id]);

            await client.query(`
        INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'reject_submission',
                'submission',
                id,
                adminUserId,
                'admin@example.com',
                JSON.stringify({ reason, notes })
            ]);

            return { success: true };
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/submissions/:id/request-changes - Request changes
router.post('/:id/request-changes', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const adminUserId = '00000000-0000-0000-0000-000000000001';

        await transaction(async (client) => {
            await client.query(`
        UPDATE submissions 
        SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_notes = $3
        WHERE id = $4
      `, ['needs-work', adminUserId, notes, id]);

            await client.query(`
        INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'request_changes',
                'submission',
                id,
                adminUserId,
                'admin@example.com',
                JSON.stringify({ notes })
            ]);
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;
