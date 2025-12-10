import express from 'express';
import { query, transaction } from '../db/index.js';

const router = express.Router();

// POST /api/admin/incubation/nominate - Nominate project for incubation
router.post('/incubation/nominate', async (req, res, next) => {
    try {
        const { project_id, target, notes } = req.body;

        const adminUserId = '00000000-0000-0000-0000-000000000001';

        const result = await transaction(async (client) => {
            const incubationResult = await client.query(`
        INSERT INTO incubation_projects (
          project_id, status, target, nominated_by, maturity_score, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [project_id, 'nominated', target, adminUserId, 0, notes]);

            await client.query(`
        INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'nominate_incubation',
                'incubation_project',
                incubationResult.rows[0].id,
                adminUserId,
                'admin@example.com',
                JSON.stringify({ project_id, target })
            ]);

            return incubationResult.rows[0];
        });

        res.status(201).json({ incubation: result });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/admin/incubation/:id - Update incubation project
router.patch('/incubation/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, maturity_score, notes } = req.body;

        const adminUserId = '00000000-0000-0000-0000-000000000001';

        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (status) {
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }

        if (maturity_score !== undefined) {
            updates.push(`maturity_score = $${paramIndex++}`);
            params.push(maturity_score);
        }

        if (notes) {
            updates.push(`notes = $${paramIndex++}`);
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        params.push(id);

        const result = await transaction(async (client) => {
            const updateResult = await client.query(`
        UPDATE incubation_projects
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

            await client.query(`
        INSERT INTO audit_log (action, resource_type, resource_id, user_id, user_email, details)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                'update_incubation',
                'incubation_project',
                id,
                adminUserId,
                'admin@example.com',
                JSON.stringify({ status, maturity_score, notes })
            ]);

            return updateResult.rows[0];
        });

        res.json({ incubation: result });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/incubation - Get all incubation projects
router.get('/incubation', async (req, res, next) => {
    try {
        const result = await query(`
      SELECT i.*, p.name as project_name, p.description as project_description
      FROM incubation_projects i
      JOIN projects p ON i.project_id = p.id
      ORDER BY i.created_at DESC
    `);

        res.json({ incubations: result.rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/audit - Get audit log
router.get('/audit', async (req, res, next) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const result = await query(`
      SELECT * FROM audit_log
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

        res.json({ audit_logs: result.rows, total: result.rowCount });
    } catch (error) {
        next(error);
    }
});

export default router;
