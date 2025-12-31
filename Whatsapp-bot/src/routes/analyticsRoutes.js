import express from 'express';
import {
  trackEvent,
  getEvents,
  getActiveUsers,
  getEventStats,
  getTopEvents,
  getDashboardMetrics,
  calculateDailyMetrics,
  getTodayMetrics,
  getRealtimeDashboard,
  getUserEngagementMetrics,
} from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics event routes
router.post('/events', trackEvent);
router.get('/events', getEvents);
router.get('/events/stats', getEventStats);
router.get('/events/top', getTopEvents);

// Real-time analytics
router.get('/active-users', getActiveUsers);
router.get('/realtime', getRealtimeDashboard);

// Dashboard metrics routes
router.get('/metrics', getDashboardMetrics);
router.get('/metrics/today', getTodayMetrics);
router.post('/metrics/calculate', calculateDailyMetrics);

// Engagement metrics
router.get('/engagement', getUserEngagementMetrics);

export default router;
