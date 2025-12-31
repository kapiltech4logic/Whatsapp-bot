import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

// Create project
export const createProject = async (req, res) => {
  try {
    const { organizationId, name, slug, type, settings, features } = req.body;

    if (!organizationId || !name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID, name, and slug are required'
      });
    }

    // Check access - must be org admin or super admin
    if (!req.user.isSuperAdmin && req.user.organizationId?.toString() !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check project limit
    const projectCount = await Project.countDocuments({ organizationId });
    if (projectCount >= organization.limits.maxProjects && organization.limits.maxProjects !== -1) {
      return res.status(400).json({
        success: false,
        error: `Project limit reached (${organization.limits.maxProjects})`
      });
    }

    // Check if slug already exists for this organization
    const existing = await Project.findBySlug(organizationId, slug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Project with this slug already exists in this organization'
      });
    }

    const project = await Project.create({
      organizationId,
      name,
      slug: slug.toLowerCase(),
      type: type || 'WHATSAPP',
      settings: settings || {},
      features: features || ['basic_analytics', 'message_tracking']
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get projects
export const getProjects = async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    let query = {};

    // If not super admin, filter by organization
    if (!req.user.isSuperAdmin) {
      if (!req.user.organizationId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      query.organizationId = req.user.organizationId;
    } else if (organizationId) {
      // Convert string to ObjectId for proper query
      query.organizationId = new mongoose.Types.ObjectId(organizationId);
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('organizationId', 'name slug tier')
      .sort({ createdAt: -1 });

    // Enrich with user and session counts
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const userCount = await User.countDocuments({
          'metadata.projectId': project._id.toString()
        });
        const sessionCount = await Session.countDocuments({
          'metadata.projectId': project._id.toString()
        });
        
        return {
          ...project.toObject(),
          userCount,
          sessionCount,
          isActive: project.status === 'ACTIVE'
        };
      })
    );

    res.json({
      success: true,
      data: enrichedProjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('organizationId', 'name slug tier status');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && 
        project.organizationId._id.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { name, type, settings, features, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && 
        project.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (name) project.name = name;
    if (type) project.type = type;
    if (settings) project.settings = { ...project.settings, ...settings };
    if (features) project.features = features;
    if (status) project.status = status;

    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check access - must be org admin or super admin
    if (!req.user.isSuperAdmin && 
        project.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Soft delete - archive instead of hard delete
    project.status = 'ARCHIVED';
    await project.save();

    res.json({
      success: true,
      message: 'Project archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get users for a specific project
export const getProjectUsers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify project exists and check access
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && 
        project.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get users for this project
    const users = await User.find({
      'metadata.projectId': id
    }).sort({ createdAt: -1 });

    // Enrich with session and message counts
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const sessionCount = await Session.countDocuments({
          userId: user._id
        });
        
        const sessions = await Session.find({ userId: user._id });
        const messageCount = sessions.reduce((sum, session) => {
          return sum + (session.metadata?.totalMessages || 0);
        }, 0);

        const lastSession = sessions.length > 0 
          ? sessions.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))[0]
          : null;

        return {
          _id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          language: user.language,
          sessionCount,
          messageCount,
          lastActive: lastSession?.lastActivityAt || user.createdAt,
          createdAt: user.createdAt,
          metadata: user.metadata
        };
      })
    );

    res.json({
      success: true,
      data: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
