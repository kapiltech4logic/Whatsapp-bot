import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  tier: {
    type: String,
    enum: ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
    default: 'FREE'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'],
    default: 'TRIAL'
  },
  billingEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  customizations: {
    theme: {
      primaryColor: { type: String, default: '#007bff' },
      logo: String,
      favicon: String
    },
    features: {
      type: [String],
      default: []
    },
    integrations: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  limits: {
    maxProjects: { type: Number, default: 1 },
    maxUsersPerProject: { type: Number, default: 1000 },
    maxMessagesPerMonth: { type: Number, default: 1000 }
  },
  trialEndsAt: Date,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ slug: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ tier: 1 });

// Instance methods
organizationSchema.methods.isActive = function() {
  return this.status === 'ACTIVE';
};

organizationSchema.methods.isInTrial = function() {
  return this.status === 'TRIAL' && this.trialEndsAt && new Date() < this.trialEndsAt;
};

organizationSchema.methods.hasFeature = function(featureName) {
  return this.customizations.features.includes(featureName);
};

// Static methods
organizationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
