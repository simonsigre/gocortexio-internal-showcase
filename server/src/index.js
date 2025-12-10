import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects.js';
import submissionsRouter from './routes/submissions.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
    try {
        // Check database connection
        const { query } = await import('./db/index.js');
        await query('SELECT 1');
        res.status(200).json({ status: 'ready', database: 'connected' });
    } catch (error) {
        res.status(503).json({ status: 'not ready', error: error.message });
    }
});

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Cortex Pre-Sales Arsenal API',
        version: '1.0.0',
        endpoints: {
            projects: '/api/projects',
            submissions: '/api/submissions',
            admin: '/api/admin',
            users: '/api/users',
            health: '/health',
            ready: '/ready'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Cortex Arsenal API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}\n`);
});

export default app;
