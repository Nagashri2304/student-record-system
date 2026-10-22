/**
 * Role-Based Access Control (RBAC) & JWT Verification Middleware
 * Requirement: SRS FR-01, SEC-02; Test Plan TC-01, TC-06
 * Issue: #7 [SP-5] FR-01: Secure Authentication & Role-Based Access Control
 * Author: Monika PM (@Monikapm19)
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edutrack_jwt_secret_key_2026';

/**
 * Middleware: Verify JWT Bearer Token
 * Rejects with HTTP 401 Unauthorized if missing, malformed, invalid, or expired.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { user_id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Middleware Factory: Enforce Role-Based Access Control (RBAC)
 * Rejects unauthorized role access with HTTP 403 Forbidden.
 *
 * @param {...string} allowedRoles - List of permitted roles (e.g. 'Admin', 'Faculty')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  JWT_SECRET,
};
