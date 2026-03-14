import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import connectDB from './lib/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import examRoutes from './routes/exams';
import scheduleRoutes from './routes/schedules';
import dayplanRoutes from './routes/dayplans';
import taskRoutes from './routes/tasks';
import mockRoutes from './routes/mocks';
import groupRoutes from './routes/groups';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// --- CORS ---
// Allow requests from the configured CLIENT_ORIGIN (Vercel) and localhost for dev
const allowedOrigins = [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Render health checks, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any vercel.app subdomain
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Don't throw - just deny cleanly so OPTIONS doesn't return 500
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));

// --- Middleware ---
app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled to allow React app to load
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dayplans', dayplanRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mocks', mockRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Serve React client in production ---
// Removed because frontend is hosted independently on Vercel
// Fallback 404 for unhandled API routes
app.use((req, res) => {
    res.status(404).json({ error: 'API route not found: ' + req.originalUrl });
});

// Error handler (must be last)
app.use(errorHandler);

// Start
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${isProd ? 'PROD' : 'DEV'}]`));
});

export default app;
