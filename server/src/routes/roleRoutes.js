import express from 'express';
import { getRoles } from '../controllers/roleController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getRoles);

export default router; 