import express from 'express';
import { login, getCurrentUser, changePassword, verifyToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);
router.get('/verify', authenticate, verifyToken);

export default router;
