/**
 * RBAC (Role-Based Access Control) Middleware
 * Checks if user has required role/permissions
 */

/**
 * Require specific roles
 * @param {Array<String>} roles - Array of allowed roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Require Super Admin role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Super Admin access required'
    });
  }

  next();
};

/**
 * Require Organization Admin or Super Admin
 */
export const requireOrgAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.isSuperAdmin && !req.user.isOrgAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Organization Admin access required'
    });
  }

  next();
};

/**
 * Check if user has access to specific project
 * @param {String} projectIdParam - Request parameter name containing project ID
 */
export const requireProjectAccess = (projectIdParam = 'projectId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Super admins have access to everything
    if (req.user.isSuperAdmin) {
      return next();
    }

    const projectId = req.params[projectIdParam] || req.query[projectIdParam] || req.body[projectIdParam];

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID required'
      });
    }

    // Check if user has access to this project
    const hasAccess = req.user.projectAccess?.some(
      access => access.projectId.toString() === projectId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'No access to this project'
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission on a project
 * @param {String} projectIdParam - Request parameter name containing project ID
 * @param {Array<String>} allowedRoles - Allowed project roles (OWNER, ADMIN, EDITOR, VIEWER)
 */
export const requireProjectRole = (projectIdParam = 'projectId', allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Super admins bypass role check
    if (req.user.isSuperAdmin) {
      return next();
    }

    const projectId = req.params[projectIdParam] || req.query[projectIdParam] || req.body[projectIdParam];

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID required'
      });
    }

    // Find user's role for this project
    const projectAccess = req.user.projectAccess?.find(
      access => access.projectId.toString() === projectId.toString()
    );

    if (!projectAccess) {
      return res.status(403).json({
        success: false,
        error: 'No access to this project'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(projectAccess.role)) {
      return res.status(403).json({
        success: false,
        error: `Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    // Attach project role to request for later use
    req.projectRole = projectAccess.role;

    next();
  };
};
