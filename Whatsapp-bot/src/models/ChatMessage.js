import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  sessionId: {
    type: String,
    ref: 'Session',
    required: true,
  },
  sender: {
    type: String,
    required: true,
    enum: ['USER', 'BOT', 'AGENT'],
  },
  messageType: {
    type: String,
    required: true,
    enum: ['text', 'image', 'interactive', 'location', 'document', 'audio', 'video', 'sticker', 'contacts'],
    default: 'text',
  },
  contentPayload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
  collection: 'chat_messages',
});

// Indexes
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ isRead: 1 });
chatMessageSchema.index({ sender: 1 });

// Static method to get conversation
chatMessageSchema.statics.getConversation = async function(sessionId, limit = 100) {
  return this.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(limit);
};

// Static method to get unread count
chatMessageSchema.statics.getUnreadCount = async function(sessionId) {
  return this.countDocuments({ sessionId, sender: 'USER', isRead: false });
};

// Static method to mark messages as read
chatMessageSchema.statics.markAsRead = async function(sessionId) {
  return this.updateMany(
    { sessionId, sender: 'USER', isRead: false },
    { $set: { isRead: true } }
  );
};

// Static method to calculate response time
chatMessageSchema.statics.getAverageResponseTime = async function(dateRange = {}) {
  const matchStage = { sender: 'USER' };
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end),
    };
  }
  
  const userMessages = await this.find(matchStage).sort({ createdAt: 1 });
  
  let totalResponseTime = 0;
  let responseCount = 0;
  
  for (const userMsg of userMessages) {
    const botResponse = await this.findOne({
      sessionId: userMsg.sessionId,
      sender: 'BOT',
      createdAt: { $gt: userMsg.createdAt },
    }).sort({ createdAt: 1 });
    
    if (botResponse) {
      totalResponseTime += (botResponse.createdAt - userMsg.createdAt);
      responseCount++;
    }
  }
  
  return responseCount > 0 ? totalResponseTime / responseCount / 1000 : 0; // Return in seconds
};

export default mongoose.model('ChatMessage', chatMessageSchema);
