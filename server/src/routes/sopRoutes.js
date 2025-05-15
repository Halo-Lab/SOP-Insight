import express from 'express';
import { createSop, getSops, updateSop, deleteSop, getDefaultSops } from '../controllers/sopController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createSop);
router.get('/', authenticateToken, getSops);
router.put('/:id', authenticateToken, updateSop);
router.delete('/:id', authenticateToken, deleteSop);
router.get('/default-sops', authenticateToken, getDefaultSops);

export default router; 