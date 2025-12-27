import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'button', 'interactive'],
    default: 'text',
  },
  status: {
    type: String,
    enum: ['received', 'processed', 'replied'],
    default: 'received',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Create index for faster queries
messageSchema.index({ from: 1, timestamp: -1 });
messageSchema.index({ messageId: 1 });

export const Message = mongoose.model('Message', messageSchema);
