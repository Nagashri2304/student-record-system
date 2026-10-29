/**
 * Security Audit Logging Controller
 * Requirement: SRS FR-13, SEC-03, SEC-04; Test Plan TC-09
 * Issue: #18 [SP-3] SEC-03: Immutable Security Audit Logging for Data Alterations
 * Author: Monika PM (@Monikapm19)
 */
const auditModel = require('../models/auditModel');

/**
 * GET /api/v1/audit-logs
 * Retrieve system audit logs with optional filters and pagination.
 * Restricted strictly to Administrators.
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action, entity_type, actor_user_id, limit = 50, offset = 0, page = 1 } = req.query;

    const computedOffset = offset ? Number(offset) : (Number(page) - 1) * Number(limit);

    const result = await auditModel.getAuditLogs({
      action,
      entity_type,
      actor_user_id,
      limit: Number(limit),
      offset: computedOffset,
    });

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully.',
      total: result.total,
      count: result.logs.length,
      page: Number(page) || 1,
      data: result.logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching audit trail.',
    });
  }
};

/**
 * Reject any UPDATE or DELETE attempt on audit logs with HTTP 405 Method Not Allowed
 */
const rejectMutation = (req, res) => {
  return res.status(405).json({
    success: false,
    message: 'Security Policy Violation: audit_logs is append-only and immutable. UPDATE and DELETE are prohibited.',
  });
};

module.exports = {
  getAuditLogs,
  rejectMutation,
};
