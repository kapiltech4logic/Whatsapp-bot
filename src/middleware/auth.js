import jwt from 'jsonwebtoken';
import PlatformUser from '../models/PlatformUser.js';
import { config } from '../config/config.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from database
    const user = await PlatformUser.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not active'
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      projectAccess: user.projectAccess,
      isSuperAdmin: user.isSuperAdmin(),
      isOrgAdmin: user.isOrgAdmin()
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await PlatformUser.findById(decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        projectAccess: user.projectAccess,
        isSuperAdmin: user.isSuperAdmin(),
        isOrgAdmin: user.isOrgAdmin()
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
