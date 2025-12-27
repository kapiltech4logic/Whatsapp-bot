import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  preferenceKey: {
    type: String,
    required: true,
    enum: [
      'notifications_enabled',
      'preferred_time_slot',
      'communication_frequency',
      'interests',
      'location',
      'language_preference',
      'theme',
      'other',
    ],
  },
  preferenceValue: {
    type: mongoose.Schema.Types.Mixed, // Can be String, Number, Boolean, Array, or Object
    default: null,
  },
}, {
  timestamps: true,
  collection: 'user_preferences',
});

// Compound unique index to prevent duplicate preferences
userPreferenceSchema.index({ userId: 1, preferenceKey: 1 }, { unique: true });
userPreferenceSchema.index({ preferenceKey: 1 });

// Static method to get all preferences for a user
userPreferenceSchema.statics.getUserPreferences = async function(userId) {
  const preferences = await this.find({ userId });
  return preferences.reduce((acc, pref) => {
    acc[pref.preferenceKey] = pref.preferenceValue;
    return acc;
  }, {});
};

// Static method to set a preference
userPreferenceSchema.statics.setPreference = async function(userId, key, value) {
  return this.findOneAndUpdate(
    { userId, preferenceKey: key },
    { preferenceValue: value },
    { upsert: true, new: true }
  );
};

export default mongoose.model('UserPreference', userPreferenceSchema);
