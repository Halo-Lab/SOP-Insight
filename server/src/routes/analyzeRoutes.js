import express from 'express';
import { analyzeTranscripts, analyzeTranscriptsStream } from '../controllers/analyzeController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, analyzeTranscripts);
router.post('/stream', authenticateToken, analyzeTranscriptsStream);
// For backward compatibility
router.post('-stream', authenticateToken, analyzeTranscriptsStream);

export default router; 