import express from 'express';
import {
  getDashboardStats,
  getUserGrowth,
  getSessionTrends,
  getHourlyActivity,
  getTopFlowSteps,
  getRealTimeStats,
  getConversionFunnel,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard statistics routes
router.get('/stats', getDashboardStats);
router.get('/growth/users', getUserGrowth);
router.get('/trends/sessions', getSessionTrends);
router.get('/activity/hourly', getHourlyActivity);
router.get('/flow-steps/top', getTopFlowSteps);
router.get('/realtime', getRealTimeStats);
router.get('/funnel', getConversionFunnel);

export default router;
