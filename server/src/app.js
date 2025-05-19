import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Sentry } from '../sentry.js';
import authenticateToken from './middlewares/auth.js';
import { specs, swaggerUi } from './config/swagger.js';
import { corsMiddleware } from './middlewares/cors.js';

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

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://sop-insight.staging.halo-lab.team',
  'https://sop-insight.halo-lab.team'
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers middleware
app.use(corsMiddleware);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

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