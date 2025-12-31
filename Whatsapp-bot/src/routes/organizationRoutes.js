import express from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats
} from '../controllers/organizationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin, requireOrgAdmin } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Organization CRUD
router.post('/', requireSuperAdmin, createOrganization);
router.get('/', getOrganizations); // Returns all for super admin, own for org admin
router.get('/:id', getOrganizationById);
router.put('/:id', requireOrgAdmin, updateOrganization);
router.delete('/:id', requireSuperAdmin, deleteOrganization);

// Organization stats
router.get('/:id/stats', getOrganizationStats);

export default router;
