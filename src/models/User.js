import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+\d{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Use E.164 format (+919876543210)`
    }
  },
  name: {
    type: String,
    default: null,
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'gu', 'ta', 'te', 'bn', 'mr', 'kn'],
    default: 'en',
  },
  userType: {
    type: String,
    enum: ['NEW', 'RETURNING', 'ACTIVE', 'INACTIVE'],
    default: 'NEW',
  },
  firstSeen: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  collection: 'users',
});

// Indexes (phoneNumber unique index is already created by schema definition)
userSchema.index({ userType: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ 'metadata.projectId': 1 });

// Virtual for session count
userSchema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'userId',
});

// Method to update user type based on session count
userSchema.methods.updateUserType = async function() {
  const Session = mongoose.model('Session');
  const sessionCount = await Session.countDocuments({ userId: this._id });
  
  if (sessionCount === 0 || sessionCount === 1) {
    this.userType = 'NEW';
  } else if (sessionCount >= 2 && sessionCount <= 5) {
    this.userType = 'RETURNING';
  } else if (sessionCount >= 6) {
    this.userType = 'ACTIVE';
  }
  
  // Check for inactive users (30+ days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (this.lastActive < thirtyDaysAgo) {
    this.userType = 'INACTIVE';
  }
  
  await this.save();
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);
