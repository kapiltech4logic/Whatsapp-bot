import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  source: {
    type: String,
    enum: ['QR_CODE', 'DIRECT_LINK', 'AD_CLICK', 'REFERRAL', 'ORGANIC', 'OTHER'],
    default: 'ORGANIC',
  },
  channel: {
    type: String,
    enum: ['WHATSAPP', 'WEB', 'MOBILE_APP'],
    default: 'WHATSAPP',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
  durationSeconds: {
    type: Number,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  collection: 'sessions',
});

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ source: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ startTime: -1 });

// Virtual for session flows
sessionSchema.virtual('flows', {
  ref: 'SessionFlow',
  localField: '_id',
  foreignField: 'sessionId',
});

// Virtual for chat messages
sessionSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'sessionId',
});

// Method to end session
sessionSchema.methods.endSession = function() {
  if (!this.isActive) {
    return this;
  }
  
  this.endTime = new Date();
  this.durationSeconds = Math.floor((this.endTime - this.startTime) / 1000);
  this.isActive = false;
  
  return this.save();
};

// Method to add flow step
sessionSchema.methods.addFlowStep = async function(flowStep, stepData = {}) {
  const SessionFlow = mongoose.model('SessionFlow');
  
  // Get the current step order
  const lastFlow = await SessionFlow.findOne({ sessionId: this._id })
    .sort({ stepOrder: -1 });
  
  const stepOrder = lastFlow ? lastFlow.stepOrder + 1 : 1;
  
  return SessionFlow.create({
    sessionId: this._id,
    flowStep,
    stepOrder,
    stepData,
  });
};

export default mongoose.model('Session', sessionSchema);
