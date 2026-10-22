/**
 * Student Management Routes
 * Requirement: SRS FR-02, SEC-01, SEC-08; Test Plan TC-02, TC-07
 * Author: Kushitha K (@Kushitha30)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const { authorizeStudentAccess } = require('../middleware/objectAuth');
const studentController = require('../controllers/studentController');
const courseController = require('../controllers/courseController');

const router = express.Router();

// Public / Authenticated Meta Routes
router.get('/meta/departments', verifyToken, studentController.getDepartmentsList);

// Profile of the logged-in student (Self-Service)
router.get('/me', verifyToken, authorizeRoles('Student'), studentController.getMyProfile);

// Students Collection (Admin and Faculty can list, Admin can create)
router.get('/', verifyToken, authorizeRoles('Admin', 'Faculty'), studentController.getAllStudents);
router.post('/', verifyToken, authorizeRoles('Admin'), studentController.createStudent);

// Specific Student by ID (Protected by Object-Level Authorization against IDOR)
router.get('/:id', verifyToken, authorizeStudentAccess, studentController.getStudentById);
router.put('/:id', verifyToken, authorizeRoles('Admin'), studentController.updateStudent);
router.delete('/:id', verifyToken, authorizeRoles('Admin'), studentController.archiveStudent);

// Student Course Enrollments
router.get('/:id/enrollments', verifyToken, authorizeStudentAccess, courseController.getStudentEnrollments);

module.exports = router;
