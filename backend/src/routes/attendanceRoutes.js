/**
 * Attendance Alert & Aggregator Routes
 * Requirement: SRS FR-07 (Attendance Percentage Engine & Low Attendance Alert (<75%) System)
 * Test Plan: TC-04, TC-07
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

// FR-07: Real-time Low Attendance Alerts (<75%) for Faculty & Admin
router.get('/alerts', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.getAttendanceAlerts);

// FR-07: Automated Alert Dispatch (SMS/Email Warnings)
router.post('/alerts/dispatch', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.dispatchAttendanceAlerts);

module.exports = router;
