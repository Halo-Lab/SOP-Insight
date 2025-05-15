import express from 'express';
import {
  analyzeTranscripts,
  analyzeTranscriptsStream,
  saveAnalysisHistory,
  getAnalysisHistory,
  getAnalysisHistoryItem,
  deleteAnalysisHistory,
  updateAnalysisHistoryName
} from '../controllers/analyzeController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, analyzeTranscripts);
router.post('/stream', authenticateToken, analyzeTranscriptsStream);

router.post('/history', authenticateToken, saveAnalysisHistory);
router.get('/history', authenticateToken, getAnalysisHistory);
router.get('/history/:id', authenticateToken, getAnalysisHistoryItem);
router.delete('/history/:id', authenticateToken, deleteAnalysisHistory);
router.put('/history/:id', authenticateToken, updateAnalysisHistoryName);

export default router; 