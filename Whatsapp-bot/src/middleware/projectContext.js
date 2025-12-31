import Project from '../models/Project.js';

/**
 * Project Context Middleware
 * Extracts and validates project context from request
 * Attaches project data to req.project
 */
export const projectContext = async (req, res, next) => {
  try {
    // Try to get projectId from various sources
    const projectId = req.params.projectId || 
                     req.query.projectId || 
                     req.body.projectId ||
                     req.headers['x-project-id'];

    if (!projectId) {
      // Project context is optional for some routes
      return next();
    }

    // Fetch project
    const project = await Project.findById(projectId).populate('organizationId');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if project is active
    if (project.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: `Project is ${project.status.toLowerCase()}`
      });
    }

    // If user is authenticated, verify access
    if (req.user) {
      // Super admins have access to all projects
      if (!req.user.isSuperAdmin) {
        // Check organization membership
        if (project.organizationId._id.toString() !== req.user.organizationId?.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this project'
          });
        }

        // Check project-level access for non-org-admins
        if (!req.user.isOrgAdmin) {
          const hasAccess = req.user.projectAccess?.some(
            access => access.projectId.toString() === projectId.toString()
          );

          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'No access to this project'
            });
          }
        }
      }
    }

    // Attach project to request
    req.project = project;
    req.projectId = projectId;
    req.organizationId = project.organizationId._id;

    next();
  } catch (error) {
    console.error('Project context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load project context'
    });
  }
};

/**
 * Require project context (fails if no project)
 */
export const requireProjectContext = async (req, res, next) => {
  await projectContext(req, res, () => {
    if (!req.project) {
      return res.status(400).json({
        success: false,
        error: 'Project context required'
      });
    }
    next();
  });
};
