import AnalyticsEvent from '../models/AnalyticsEvent.js';
import DashboardMetric from '../models/DashboardMetric.js';

// Track an event
export const trackEvent = async (req, res) => {
  try {
    const { sessionId, userId, eventCategory, eventAction, eventLabel, eventValue, metadata } = req.body;

    if (!eventCategory || !eventAction) {
      return res.status(400).json({
        success: false,
        error: 'Event category and action are required',
      });
    }

    const event = await AnalyticsEvent.trackEvent({
      sessionId: sessionId || null,
      userId: userId || null,
      eventCategory,
      eventAction,
      eventLabel: eventLabel || null,
      eventValue: eventValue || null,
      metadata: metadata || {},
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get events with filters
export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      eventCategory,
      eventAction,
      userId,
      sessionId,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (eventCategory) query.eventCategory = eventCategory;
    if (eventAction) query.eventAction = eventAction;
    if (userId) query.userId = userId;
    if (sessionId) query.sessionId = sessionId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const events = await AnalyticsEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name phoneNumber')
      .populate('sessionId', 'source channel');

    const total = await AnalyticsEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
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

// Get active users
export const getActiveUsers = async (req, res) => {
  try {
    const { minutes = 5 } = req.query;

    const activeUsers = await AnalyticsEvent.getActiveUsers(parseInt(minutes));

    res.json({ success: true, data: { activeUsers, minutes: parseInt(minutes) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get event statistics
export const getEventStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;

    const stats = await AnalyticsEvent.getEventStats(dateRange);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get top events
export const getTopEvents = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const topEvents = await AnalyticsEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            category: '$eventCategory',
            action: '$eventAction',
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          eventCategory: '$_id.category',
          eventAction: '$_id.action',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ success: true, data: topEvents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get dashboard metrics
export const getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const metrics = await DashboardMetric.getMetrics(start, end, category || null);

    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Calculate daily metrics
export const calculateDailyMetrics = async (req, res) => {
  try {
    const { date } = req.body;

    const targetDate = date ? new Date(date) : new Date();

    const result = await DashboardMetric.calculateDailyMetrics(targetDate);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get metrics summary for today
export const getTodayMetrics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const metrics = await DashboardMetric.find({ metricDate: new Date(today) });

    const summary = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricCategory]) {
        acc[metric.metricCategory] = {};
      }
      acc[metric.metricCategory][metric.metricName] = {
        value: metric.metricValue,
        breakdown: metric.breakdown,
      };
      return acc;
    }, {});

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get real-time dashboard data
export const getRealtimeDashboard = async (req, res) => {
  try {
    // Active users in last 5 minutes
    const activeUsers = await AnalyticsEvent.getActiveUsers(5);

    // Today's metrics
    const today = new Date().toISOString().split('T')[0];
    const todayMetrics = await DashboardMetric.find({ metricDate: new Date(today) });

    // Recent events (last 100)
    const recentEvents = await AnalyticsEvent.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('eventCategory eventAction eventLabel createdAt');

    // Event breakdown by category
    const eventsByCategory = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$eventCategory',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        activeUsers,
        todayMetrics: todayMetrics.reduce((acc, m) => {
          acc[m.metricName] = {
            value: m.metricValue,
            breakdown: m.breakdown,
            category: m.metricCategory,
          };
          return acc;
        }, {}),
        recentEvents,
        eventsByCategory: eventsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user engagement metrics
export const getUserEngagementMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {
      eventCategory: 'Engagement',
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const engagementData = await AnalyticsEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            action: '$eventAction',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          date: '$_id.date',
          action: '$_id.action',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json({ success: true, data: engagementData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
