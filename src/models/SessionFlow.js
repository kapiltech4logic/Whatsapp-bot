import mongoose from 'mongoose';

const sessionFlowSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  sessionId: {
    type: String,
    ref: 'Session',
    required: true,
  },
  flowStep: {
    type: String,
    required: true,
    enum: [
      'WELCOME',
      'MENU_MAIN',
      'BROWSE_CATALOG',
      'SEARCH',
      'FAQ',
      'CONTACT_SUPPORT',
      'FEEDBACK',
      'CHECKOUT',
      'PAYMENT',
      'ORDER_CONFIRMATION',
      'OTHER',
    ],
  },
  stepOrder: {
    type: Number,
    required: true,
  },
  stepTimestamp: {
    type: Date,
    default: Date.now,
  },
  stepData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false,
  collection: 'session_flows',
});

// Indexes
sessionFlowSchema.index({ sessionId: 1, stepOrder: 1 });
sessionFlowSchema.index({ flowStep: 1 });
sessionFlowSchema.index({ stepTimestamp: -1 });

// Static method to get journey for a session
sessionFlowSchema.statics.getSessionJourney = async function(sessionId) {
  return this.find({ sessionId }).sort({ stepOrder: 1 });
};

// Static method for funnel analysis
sessionFlowSchema.statics.getFunnelAnalysis = async function(dateRange = {}) {
  const matchStage = {};
  if (dateRange.start && dateRange.end) {
    matchStage.stepTimestamp = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end),
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$flowStep',
        totalUsers: { $addToSet: '$sessionId' },
        avgStepOrder: { $avg: '$stepOrder' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        flowStep: '$_id',
        uniqueSessions: { $size: '$totalUsers' },
        avgStepOrder: 1,
        count: 1,
      },
    },
    { $sort: { avgStepOrder: 1 } },
  ]);
};

export default mongoose.model('SessionFlow', sessionFlowSchema);
