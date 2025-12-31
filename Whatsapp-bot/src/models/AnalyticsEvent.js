import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  sessionId: {
    type: String,
    ref: 'Session',
    default: null,
  },
  userId: {
    type: String,
    ref: 'User',
    default: null,
  },
  eventCategory: {
    type: String,
    required: true,
    enum: ['User', 'Engagement', 'System', 'Marketing', 'Conversation'],
  },
  eventAction: {
    type: String,
    required: true,
  },
  eventLabel: {
    type: String,
    default: null,
  },
  eventValue: {
    type: Number,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  collection: 'analytics_events',
});

// Compound indexes for common queries
analyticsEventSchema.index({ eventCategory: 1, eventAction: 1 });
analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ userId: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: -1 });

// Static method to track event
analyticsEventSchema.statics.trackEvent = async function(eventData) {
  return this.create(eventData);
};

// Static method to get active users
analyticsEventSchema.statics.getActiveUsers = async function(minutes = 5) {
  const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: timeAgo },
        eventCategory: 'Engagement',
        userId: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        count: { $size: '$uniqueUsers' },
      },
    },
  ]);
  
  return result.length > 0 ? result[0].count : 0;
};

// Static method for event aggregation
analyticsEventSchema.statics.getEventStats = async function(dateRange = {}) {
  const matchStage = {};
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end),
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          category: '$eventCategory',
          action: '$eventAction',
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgValue: { $avg: '$eventValue' },
      },
    },
    {
      $project: {
        eventCategory: '$_id.category',
        eventAction: '$_id.action',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgValue: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Post-save middleware to update user's last_active
analyticsEventSchema.post('save', async function(doc) {
  if (doc.userId) {
    try {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(doc.userId, {
        lastActive: doc.createdAt,
      });
    } catch (error) {
      console.error('Error updating user last_active:', error);
    }
  }
});

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
