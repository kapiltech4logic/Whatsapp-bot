import mongoose from 'mongoose';

const dashboardMetricSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  metricDate: {
    type: Date,
    required: true,
  },
  metricName: {
    type: String,
    required: true,
    enum: [
      'daily_active_users',
      'new_users',
      'total_sessions',
      'avg_session_duration',
      'messages_sent',
      'bot_response_time',
      'user_retention_7d',
      'conversion_rate',
      'engagement_rate',
    ],
  },
  metricCategory: {
    type: String,
    required: true,
    enum: ['Users', 'Sessions', 'Engagement', 'Performance', 'Conversion'],
  },
  metricValue: {
    type: Number,
    required: true,
  },
  breakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  collection: 'dashboard_metrics',
});

// Compound unique index
dashboardMetricSchema.index({ metricDate: 1, metricName: 1 }, { unique: true });
dashboardMetricSchema.index({ metricCategory: 1 });

// Static method to get metrics for a date range
dashboardMetricSchema.statics.getMetrics = async function(startDate, endDate, category = null) {
  const query = {
    metricDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  
  if (category) {
    query.metricCategory = category;
  }
  
  return this.find(query).sort({ metricDate: -1, metricCategory: 1 });
};

// Static method to set or update a metric
dashboardMetricSchema.statics.setMetric = async function(date, name, category, value, breakdown = null) {
  return this.findOneAndUpdate(
    { metricDate: new Date(date), metricName: name },
    {
      metricCategory: category,
      metricValue: value,
      breakdown,
      createdAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

// Static method to calculate daily metrics
dashboardMetricSchema.statics.calculateDailyMetrics = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const User = mongoose.model('User');
  const Session = mongoose.model('Session');
  const ChatMessage = mongoose.model('ChatMessage');
  const AnalyticsEvent = mongoose.model('AnalyticsEvent');
  
  // Daily Active Users
  const activeUsers = await AnalyticsEvent.distinct('userId', {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    userId: { $ne: null },
  });
  
  const userTypeBreakdown = await User.aggregate([
    { $match: { _id: { $in: activeUsers } } },
    { $group: { _id: '$userType', count: { $sum: 1 } } },
  ]);
  
  await this.setMetric(
    date,
    'daily_active_users',
    'Users',
    activeUsers.length,
    userTypeBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  );
  
  // New Users
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
  
  await this.setMetric(date, 'new_users', 'Users', newUsers);
  
  // Total Sessions
  const sessionsData = await Session.aggregate([
    { $match: { startTime: { $gte: startOfDay, $lte: endOfDay } } },
    {
      $group: {
        _id: '$source',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const totalSessions = sessionsData.reduce((sum, item) => sum + item.count, 0);
  const sessionBreakdown = sessionsData.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  await this.setMetric(date, 'total_sessions', 'Sessions', totalSessions, sessionBreakdown);
  
  // Average Session Duration
  const avgDuration = await Session.aggregate([
    {
      $match: {
        startTime: { $gte: startOfDay, $lte: endOfDay },
        durationSeconds: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$durationSeconds' },
      },
    },
  ]);
  
  if (avgDuration.length > 0) {
    await this.setMetric(date, 'avg_session_duration', 'Sessions', avgDuration[0].avgDuration || 0);
  }
  
  // Messages Sent
  const messagesData = await ChatMessage.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    {
      $group: {
        _id: '$sender',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const totalMessages = messagesData.reduce((sum, item) => sum + item.count, 0);
  const messageBreakdown = messagesData.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  await this.setMetric(date, 'messages_sent', 'Engagement', totalMessages, messageBreakdown);
  
  return { success: true, date };
};

export default mongoose.model('DashboardMetric', dashboardMetricSchema);
