import express from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  getSessionsByUser,
  getActiveSessions,
  getSessionsByDateRange,
  getSessionsBySource,
  getSessionsByChannel,
  endSession,
  addFlowStep,
  getSessionFlows,
  getSessionJourney,
  getFunnelAnalysis,
  addMessage,
  getSessionConversation,
  markMessagesAsRead,
  getSessionStats,
} from '../controllers/sessionController.js';

const router = express.Router();

// Session routes
router.get('/', getSessions);
router.get('/stats', getSessionStats);
router.get('/active', getActiveSessions);
router.get('/date-range', getSessionsByDateRange);
router.get('/source/:source', getSessionsBySource);
router.get('/channel/:channel', getSessionsByChannel);
router.get('/user/:userId', getSessionsByUser);
router.get('/funnel', getFunnelAnalysis);
router.post('/', createSession);
router.get('/:id', getSessionById);
router.put('/:id/end', endSession);

// Session flow routes
router.get('/:id/flows', getSessionFlows);
router.post('/:id/flows', addFlowStep);
router.get('/:id/journey', getSessionJourney);

// Session message routes
router.post('/:id/messages', addMessage);
router.get('/:id/messages', getSessionConversation);
router.put('/:id/messages/read', markMessagesAsRead);

export default router;
