import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';

dotenv.config();

const SENTRY_DSN = process.env.SENTRY_DSN || "https://023324c2edc19a51558e82f1749c7355@o4509317510922240.ingest.de.sentry.io/4509317513871440";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profilesSampleRate: 1.0,
  sendDefaultPii: true,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
    nodeProfilingIntegration(),
  ],
});

console.log('Sentry initialized successfully'); 