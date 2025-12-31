import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectUsers
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAdmin } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', requireOrgAdmin, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/users', getProjectUsers);
router.put('/:id', requireOrgAdmin, updateProject);
router.delete('/:id', requireOrgAdmin, deleteProject);

export default router;
