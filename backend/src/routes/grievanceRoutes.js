/**
 * Grievance Resolution Workflow Routes
 * Requirement: SRS FR-10, FR-15; Architecture Component C9 (Grievance Service)
 * Issue: #16 [SP-3] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow
 * Author: Kushitha K (@Kushitha30)
 */
const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');

// POST /api/v1/grievances - Students create ticket in Open state; Admins can also create
router.post('/', verifyToken, authorizeRoles('Student', 'Admin'), grievanceController.createGrievance);

// GET /api/v1/grievances - List grievances (filtered by role)
router.get('/', verifyToken, authorizeRoles('Student', 'Faculty', 'Admin'), grievanceController.listGrievances);

// GET /api/v1/grievances/:id - View grievance details and resolution notes (with IDOR protection)
router.get('/:id', verifyToken, grievanceController.getGrievanceById);

// PATCH /api/v1/grievances/:id - Update status (e.g. to Resolved) & resolution notes by assigned faculty or admin
router.patch('/:id', verifyToken, authorizeRoles('Faculty', 'Admin'), grievanceController.updateGrievance);

module.exports = router;
