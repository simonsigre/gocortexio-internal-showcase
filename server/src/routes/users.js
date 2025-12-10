import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req, res, next) => {
    try {
        const result = await query('SELECT id, email, name, role, theatre FROM users ORDER BY created_at DESC');
        res.json({ users: result.rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await query('SELECT id, email, name, role, theatre FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

export default router;
