/**
 * Security Audit Log Routes
 * Requirement: SRS FR-13, SEC-03; Test Plan TC-09
 * Issue: #18 [SP-3] SEC-03: Immutable Security Audit Logging for Data Alterations
 * Author: Monika PM (@Monikapm19)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const auditController = require('../controllers/auditController');

const router = express.Router();

// Retrieve audit trail - Restricted exclusively to Administrator
router.get('/', verifyToken, authorizeRoles('Admin'), auditController.getAuditLogs);

// Enforce immutability on individual audit log entries (reject UPDATE and DELETE)
router.put('/:id', verifyToken, authorizeRoles('Admin'), auditController.rejectMutation);
router.patch('/:id', verifyToken, authorizeRoles('Admin'), auditController.rejectMutation);
router.delete('/:id', verifyToken, authorizeRoles('Admin'), auditController.rejectMutation);

module.exports = router;
