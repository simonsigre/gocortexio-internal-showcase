import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/projects - Get all published projects
router.get('/', async (req, res, next) => {
    try {
        const { product, theatre, status = 'published', search } = req.query;

        let sql = 'SELECT * FROM projects WHERE status = $1';
        const params = [status];

        if (product) {
            params.push(product);
            sql += ` AND product = $${params.length}`;
        }

        if (theatre) {
            params.push(theatre);
            sql += ` AND theatre = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }

        sql += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';

        const result = await query(sql, params);
        res.json({ projects: result.rows, total: result.rowCount });
    } catch (error) {
        next(error);
    }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            'SELECT * FROM projects WHERE id = $1 OR name = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ project: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// POST /api/projects - Create new project (requires auth - TODO)
router.post('/', async (req, res, next) => {
    try {
        const {
            name, description, link, repo, product, theatre, usecase, language,
            status = 'draft', tags = [], technical_stack = []
        } = req.body;

        // TODO: Get user from JWT token
        const submitted_by = '00000000-0000-0000-0000-000000000001'; // System user for now

        const result = await query(
            `INSERT INTO projects (
        name, description, link, repo, product, theatre, usecase, language,
        status, submitted_by, tags, technical_stack
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [name, description, link, repo, product, theatre, usecase, language,
                status, submitted_by, tags, technical_stack]
        );

        res.status(201).json({ project: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Project name already exists' });
        }
        next(error);
    }
});

export default router;
