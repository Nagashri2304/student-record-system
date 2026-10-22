/**
 * Object-Level Authorization & Tenant Isolation Middleware
 * Requirement: SRS SEC-01, NFR-06 (Zero IDOR Leaks); Test Plan TC-07
 * Author: Kushitha K (@Kushitha30)
 */
const studentModel = require('../models/studentModel');

/**
 * Enforces that a Student actor can only access their own student record.
 * Admin and Faculty bypass this check to view students.
 * Parents can only view if linked to the child.
 *
 * Checks student ID from req.params.id (or req.params.student_id).
 */
const authorizeStudentAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to authorization.',
    });
  }

  // Admin and Faculty have elevated permissions to view/manage students
  if (req.user.role === 'Admin' || req.user.role === 'Faculty') {
    return next();
  }

  const requestedStudentId = req.params.id || req.params.student_id;
  if (!requestedStudentId) {
    return next();
  }

  try {
    const student = await studentModel.findById(requestedStudentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // If Student role, they must own the student profile (req.user.user_id === student.user_id)
    if (req.user.role === 'Student') {
      if (Number(req.user.user_id) !== Number(student.user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view or modify this resource.',
        });
      }
      return next();
    }

    // If Parent role, they must be the linked parent (student.parent_user_id === req.user.user_id)
    if (req.user.role === 'Parent') {
      if (Number(req.user.user_id) !== Number(student.parent_user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view records of unlinked students.',
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient privileges.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal authorization error.',
      error: err.message,
    });
  }
};

module.exports = {
  authorizeStudentAccess,
};
