import express from 'express';
import { signup, login, getMe, updateUserRole } from '../controllers/authController.js';
import authenticateToken from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/users/role', authenticateToken, updateUserRole);

export default router; 