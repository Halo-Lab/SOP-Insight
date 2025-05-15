import express from 'express';
import { testSentry } from '../controllers/sentryController.js';

const router = express.Router();

router.get('/test', testSentry);

export default router; 