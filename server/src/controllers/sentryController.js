import { Sentry } from '../../sentry.js';

export const testSentry = (req, res) => {
  try {
    throw new Error('Test Sentry Error on Server');
  } catch (err) {
    Sentry.captureException(err);
    res.status(200).json({ message: 'Error sent to Sentry!' });
  }
}; 