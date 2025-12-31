import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const platformUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'VIEWER'],
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
    // null for SUPER_ADMIN
  },
  projectAccess: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  metadata: {
    firstName: String,
    lastName: String,
    avatar: String
  }
}, {
  timestamps: true
});

// Indexes
platformUserSchema.index({ email: 1 });
platformUserSchema.index({ organizationId: 1, role: 1 });
platformUserSchema.index({ isActive: 1 });

// Hash password before saving
platformUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
platformUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

platformUserSchema.methods.isSuperAdmin = function() {
  return this.role === 'SUPER_ADMIN';
};

platformUserSchema.methods.isOrgAdmin = function() {
  return this.role === 'ORG_ADMIN';
};

platformUserSchema.methods.hasAccessToProject = function(projectId) {
  if (this.isSuperAdmin()) return true;
  
  return this.projectAccess.some(access => 
    access.projectId.toString() === projectId.toString()
  );
};

platformUserSchema.methods.getProjectRole = function(projectId) {
  const access = this.projectAccess.find(access => 
    access.projectId.toString() === projectId.toString()
  );
  return access ? access.role : null;
};

platformUserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
platformUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

platformUserSchema.statics.findByOrganization = function(organizationId) {
  return this.find({ organizationId, isActive: true });
};

const PlatformUser = mongoose.model('PlatformUser', platformUserSchema);

export default PlatformUser;
