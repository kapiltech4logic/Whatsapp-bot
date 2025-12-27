import User from '../models/User.js';
import Session from '../models/Session.js';
import SessionFlow from '../models/SessionFlow.js';
import ChatMessage from '../models/ChatMessage.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // Default to 7 days
    const days = parseInt(period);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await User.countDocuments();
    
    // New users in period
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Total sessions
    const totalSessions = await Session.countDocuments();
    
    // Sessions in period
    const sessionsInPeriod = await Session.countDocuments({
      startTime: { $gte: startDate }
    });

    // Active sessions
    const activeSessions = await Session.countDocuments({ isActive: true });

    // Total messages
    const totalMessages = await ChatMessage.countDocuments();

    // Average session duration
    const avgDurationResult = await Session.aggregate([
      { $match: { durationSeconds: { $gt: 0 } } },
      { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' } } }
    ]);
    const avgSessionDuration = avgDurationResult.length > 0 ? Math.round(avgDurationResult[0].avgDuration) : 0;

    // User type distribution
    const userTypeDistribution = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    // Session source distribution
    const sessionSourceDistribution = await Session.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Session channel distribution
    const sessionChannelDistribution = await Session.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalSessions,
          sessionsInPeriod,
          activeSessions,
          totalMessages,
          avgSessionDuration,
        },
        distributions: {
          userTypes: userTypeDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          sessionSources: sessionSourceDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          sessionChannels: sessionChannelDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        period: {
          days,
          startDate,
          endDate: now,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user growth data (daily breakdown)
 */
export const getUserGrowth = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: userGrowth.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get session trends (daily breakdown)
 */
export const getSessionTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

    const sessionTrends = await Session.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          },
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationSeconds' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: sessionTrends.map(item => ({
        date: item._id,
        count: item.count,
        avgDuration: Math.round(item.avgDuration || 0)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get hourly activity heatmap
 */
export const getHourlyActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const numDays = parseInt(days);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

    const hourlyActivity = await Session.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $hour: '$startTime'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing hours with 0
    const activityMap = {};
    for (let i = 0; i < 24; i++) {
      activityMap[i] = 0;
    }
    hourlyActivity.forEach(item => {
      activityMap[item._id] = item.count;
    });

    res.json({
      success: true,
      data: Object.keys(activityMap).map(hour => ({
        hour: parseInt(hour),
        count: activityMap[hour]
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get top flow steps (most common journey steps)
 */
export const getTopFlowSteps = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topSteps = await SessionFlow.aggregate([
      {
        $group: {
          _id: '$flowStep',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: topSteps.map(item => ({
        step: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get real-time stats (last 5 minutes)
 */
export const getRealTimeStats = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await Session.distinct('userId', {
      startTime: { $gte: fiveMinutesAgo },
      isActive: true
    });

    const recentSessions = await Session.countDocuments({
      startTime: { $gte: fiveMinutesAgo }
    });

    const recentMessages = await ChatMessage.countDocuments({
      createdAt: { $gte: fiveMinutesAgo }
    });

    res.json({
      success: true,
      data: {
        activeUsers: activeUsers.length,
        recentSessions,
        recentMessages,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get conversion funnel data
 */
export const getConversionFunnel = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const numDays = parseInt(days);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - numDays * 24 * 60 * 60 * 1000);

    // Define funnel steps
    const funnelSteps = ['WELCOME', 'MENU_MAIN', 'SERVICE_SELECTION', 'FORM_FILL', 'CONFIRMATION'];
    
    const funnelData = await Promise.all(
      funnelSteps.map(async (step) => {
        const count = await SessionFlow.countDocuments({
          flowStep: step,
          stepTimestamp: { $gte: startDate }
        });
        return { step, count };
      })
    );

    res.json({
      success: true,
      data: funnelData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
