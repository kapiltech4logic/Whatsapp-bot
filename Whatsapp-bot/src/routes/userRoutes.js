import express from 'express';
import {
  getUsers,
  getUserById,
  getOrCreateUser,
  updateUser,
  deleteUser,
  getUserPreferences,
  setUserPreference,
  updateUserPreferences,
  getUserStats,
} from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/', getOrCreateUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// User preferences routes
router.get('/:id/preferences', getUserPreferences);
router.post('/:id/preferences', setUserPreference);
router.put('/:id/preferences', updateUserPreferences);

export default router;
