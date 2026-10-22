/**
 * Course Catalog & Faculty Allocation Routes
 * Requirement: SRS FR-03, FR-04
 * Author: Kushitha K (@Kushitha30)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const courseController = require('../controllers/courseController');
const attendanceController = require('../controllers/attendanceController');
const gradeController = require('../controllers/gradeController');

const router = express.Router();

// List courses & single course details (Admin, Faculty, Student)
router.get('/', verifyToken, authorizeRoles('Admin', 'Faculty', 'Student'), courseController.getAllCourses);
router.get('/:id', verifyToken, authorizeRoles('Admin', 'Faculty', 'Student'), courseController.getCourseById);

// Admin-only course creation & management
router.post('/', verifyToken, authorizeRoles('Admin'), courseController.createCourse);
router.put('/:id', verifyToken, authorizeRoles('Admin'), courseController.updateCourse);

// Course enrollment & class roster (Admin and Faculty)
router.post('/:id/enroll', verifyToken, authorizeRoles('Admin', 'Faculty'), courseController.enrollStudent);
router.get('/:id/roster', verifyToken, authorizeRoles('Admin', 'Faculty'), courseController.getCourseRoster);

// Daily Attendance Endpoints (FR-04, Issue #1 - Nagashri2304)
router.post('/:id/attendance', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.markAttendance);
router.get('/:id/attendance', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.getCourseAttendance);
router.get('/:id/attendance/:sessionId', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.getAttendanceSession);
router.put('/:id/attendance/:sessionId', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.updateAttendanceSession);

// Subject Marks & Grading Endpoints (FR-05, Issue #2 - Nagashri2304)
router.post('/:id/grades', verifyToken, authorizeRoles('Admin', 'Faculty'), gradeController.submitCourseGrades);
router.get('/:id/grades', verifyToken, authorizeRoles('Admin', 'Faculty'), gradeController.getCourseGrades);
router.get('/:id/grades/audit', verifyToken, authorizeRoles('Admin', 'Faculty'), gradeController.getGradingAuditLogs);

module.exports = router;
