/**
 * Course Catalog & Faculty Allocation Routes
 * Requirement: SRS FR-03, FR-04
 * Author: Kushitha K (@Kushitha30)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const courseController = require('../controllers/courseController');

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

module.exports = router;
