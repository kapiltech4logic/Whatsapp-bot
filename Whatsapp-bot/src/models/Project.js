import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['WHATSAPP', 'WEB', 'MOBILE', 'CUSTOM'],
    default: 'WHATSAPP'
  },
  settings: {
    whatsappConfig: {
      phoneNumberId: String,
      businessAccountId: String,
      webhookVerifyToken: String
    },
    customDomain: String,
    webhookUrl: String,
    apiKeys: {
      type: [String],
      default: []
    }
  },
  features: {
    type: [String],
    default: ['basic_analytics', 'message_tracking']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes
projectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
projectSchema.index({ organizationId: 1, status: 1 });
projectSchema.index({ status: 1 });

// Instance methods
projectSchema.methods.isActive = function() {
  return this.status === 'ACTIVE';
};

projectSchema.methods.hasFeature = function(featureName) {
  return this.features.includes(featureName);
};

// Static methods
projectSchema.statics.findByOrganization = function(organizationId, status = null) {
  const query = { organizationId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

projectSchema.statics.findBySlug = function(organizationId, slug) {
  return this.findOne({ 
    organizationId,
    slug: slug.toLowerCase()
  });
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
