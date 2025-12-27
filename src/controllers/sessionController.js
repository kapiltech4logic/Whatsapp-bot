import Session from '../models/Session.js';
import SessionFlow from '../models/SessionFlow.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

// Create new session
export const createSession = async (req, res) => {
  try {
    const { userId, source, channel, metadata } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // End any active sessions for this user
    await Session.updateMany(
      { userId, isActive: true },
      { $set: { endTime: new Date(), isActive: false } }
    );

    const session = await Session.create({
      userId,
      source: source || 'ORGANIC',
      channel: channel || 'WHATSAPP',
      metadata: metadata || {},
    });

    // Track session start event
    await AnalyticsEvent.trackEvent({
      sessionId: session._id,
      userId,
      eventCategory: 'User',
      eventAction: 'Session_Start',
      eventLabel: source,
      metadata: { channel },
    });

    // Update user's last active and type
    await user.updateLastActive();
    await user.updateUserType();

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all sessions with filters
export const getSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      source,
      channel,
      isActive,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (source) query.source = source;
    if (channel) query.channel = channel;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name phoneNumber');

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('userId', 'name phoneNumber language');

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Get flows and messages
    const flows = await SessionFlow.find({ sessionId: session._id }).sort({ stepOrder: 1 });
    const messages = await ChatMessage.find({ sessionId: session._id }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        ...session.toObject(),
        flows,
        messages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// End session
export const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ success: false, error: 'Session already ended' });
    }

    await session.endSession();

    // Track session end event
    await AnalyticsEvent.trackEvent({
      sessionId: session._id,
      userId: session.userId,
      eventCategory: 'User',
      eventAction: 'Session_End',
      eventValue: session.durationSeconds,
    });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add flow step to session
export const addFlowStep = async (req, res) => {
  try {
    const { flowStep, stepData } = req.body;

    if (!flowStep) {
      return res.status(400).json({ success: false, error: 'Flow step is required' });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const flow = await session.addFlowStep(flowStep, stepData || {});

    // Track flow step event
    await AnalyticsEvent.trackEvent({
      sessionId: session._id,
      userId: session.userId,
      eventCategory: 'Engagement',
      eventAction: 'Flow_Step',
      eventLabel: flowStep,
      metadata: stepData,
    });

    res.status(201).json({ success: true, data: flow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session flows
export const getSessionFlows = async (req, res) => {
  try {
    const flows = await SessionFlow.find({ sessionId: req.params.id })
      .sort({ stepOrder: 1 });

    res.json({ success: true, data: flows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session journey (all flow steps)
export const getSessionJourney = async (req, res) => {
  try {
    const journey = await SessionFlow.getSessionJourney(req.params.id);

    res.json({ success: true, data: journey });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get funnel analysis
export const getFunnelAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;

    const funnel = await SessionFlow.getFunnelAnalysis(dateRange);

    res.json({ success: true, data: funnel });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add message to session
export const addMessage = async (req, res) => {
  try {
    const { sender, messageType, contentPayload } = req.body;

    if (!sender || !messageType || !contentPayload) {
      return res.status(400).json({
        success: false,
        error: 'Sender, message type, and content payload are required',
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const message = await ChatMessage.create({
      sessionId: req.params.id,
      sender,
      messageType,
      contentPayload,
    });

    // Track message event
    await AnalyticsEvent.trackEvent({
      sessionId: session._id,
      userId: session.userId,
      eventCategory: 'Conversation',
      eventAction: 'Message_Sent',
      eventLabel: sender,
      metadata: { messageType },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session conversation
export const getSessionConversation = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const conversation = await ChatMessage.getConversation(req.params.id, parseInt(limit));

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const result = await ChatMessage.markAsRead(req.params.id);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session stats
export const getSessionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.startTime = {};
      if (startDate) dateFilter.startTime.$gte = new Date(startDate);
      if (endDate) dateFilter.startTime.$lte = new Date(endDate);
    }

    const totalSessions = await Session.countDocuments(dateFilter);
    const activeSessions = await Session.countDocuments({ ...dateFilter, isActive: true });

    const sessionsBySource = await Session.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const avgDuration = await Session.aggregate([
      { $match: { ...dateFilter, durationSeconds: { $ne: null } } },
      { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' } } },
    ]);

    res.json({
      success: true,
      data: {
        total: totalSessions,
        active: activeSessions,
        bySource: sessionsBySource.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgDurationSeconds: avgDuration.length > 0 ? avgDuration[0].avgDuration : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by user ID
export const getSessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, isActive } = req.query;

    const query = { userId };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get active sessions
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true })
      .sort({ startTime: -1 })
      .populate('userId', 'name phoneNumber');

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by date range
export const getSessionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
    }

    const sessions = await Session.find({
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ startTime: -1 });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by source
export const getSessionsBySource = async (req, res) => {
  try {
    const { source } = req.params;

    const sessions = await Session.find({ source })
      .sort({ startTime: -1 })
      .populate('userId', 'name phoneNumber');

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by channel
export const getSessionsByChannel = async (req, res) => {
  try {
    const { channel } = req.params;

    const sessions = await Session.find({ channel })
      .sort({ startTime: -1 })
      .populate('userId', 'name phoneNumber');

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
