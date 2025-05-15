import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sentry } from '../sentry.js';
import authenticateToken from './middlewares/auth.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import sopRoutes from './routes/sopRoutes.js';
import analyzeRoutes from './routes/analyzeRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import sentryRoutes from './routes/sentryRoutes.js';

// Import error handler
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();

// Setup Express error handler
Sentry.setupExpressErrorHandler(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/sop', sopRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/roles', roleRoutes);
app.use('/test-sentry', sentryRoutes);

// Error handler
app.use(errorHandler);

export default app; 