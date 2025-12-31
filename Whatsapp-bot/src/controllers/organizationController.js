import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import PlatformUser from '../models/PlatformUser.js';

// Create organization (SuperAdmin only)
export const createOrganization = async (req, res) => {
  try {
    const { name, slug, tier, billingEmail, limits } = req.body;

    if (!name || !slug || !billingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Name, slug, and billing email are required'
      });
    }

    // Check if slug already exists
    const existing = await Organization.findBySlug(slug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Organization with this slug already exists'
      });
    }

    const organization = await Organization.create({
      name,
      slug: slug.toLowerCase(),
      tier: tier || 'FREE',
      billingEmail,
      limits: limits || {},
      status: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all organizations (SuperAdmin) or own organization (OrgAdmin)
export const getOrganizations = async (req, res) => {
  try {
    let query = {};

    // If not super admin, only show own organization
    if (!req.user.isSuperAdmin) {
      if (!req.user.organizationId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
      query._id = req.user.organizationId;
    }

    const organizations = await Organization.find(query).sort({ createdAt: -1 });

    // Enrich with project and user counts
    const enrichedOrganizations = await Promise.all(
      organizations.map(async (org) => {
        const projectCount = await Project.countDocuments({ organizationId: org._id.toString() });
        const userCount = await PlatformUser.countDocuments({ organizationId: org._id.toString() });
        
        return {
          ...org.toObject(),
          projectCount,
          userCount,
          isActive: org.status === 'ACTIVE'
        };
      })
    );

    res.json({
      success: true,
      data: enrichedOrganizations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && organization._id.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { name, tier, status, billingEmail, customizations, limits } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && organization._id.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Only super admin can change tier and status
    if (!req.user.isSuperAdmin) {
      delete req.body.tier;
      delete req.body.status;
    }

    if (name) organization.name = name;
    if (billingEmail) organization.billingEmail = billingEmail;
    if (tier && req.user.isSuperAdmin) organization.tier = tier;
    if (status && req.user.isSuperAdmin) organization.status = status;
    if (customizations) organization.customizations = { ...organization.customizations, ...customizations };
    if (limits) organization.limits = { ...organization.limits, ...limits };

    await organization.save();

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete organization (SuperAdmin only)
export const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check if there are projects
    const projectCount = await Project.countDocuments({ organizationId: organization._id });
    if (projectCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete organization with existing projects'
      });
    }

    await organization.deleteOne();

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get organization stats
export const getOrganizationStats = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check access
    if (!req.user.isSuperAdmin && organization._id.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const projectCount = await Project.countDocuments({ organizationId: organization._id });
    const activeProjects = await Project.countDocuments({ organizationId: organization._id, status: 'ACTIVE' });
    const userCount = await PlatformUser.countDocuments({ organizationId: organization._id, isActive: true });

    res.json({
      success: true,
      data: {
        organization,
        stats: {
          totalProjects: projectCount,
          activeProjects,
          totalUsers: userCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
