/**
 * Authentication & RBAC Routes
 * Issues: #7 (FR-01), #11 (SEC-01)
 * Author: Monika PM (@Monikapm19)
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');

// Public authentication endpoint
router.post('/login', authController.login);

// Token verification check endpoint
router.get('/me', verifyToken, authController.getMe);

// Role-protected test routes (enforces RBAC)
router.get('/admin-only', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Administrator. Access granted.',
    user: req.user,
  });
});

router.get('/faculty-only', verifyToken, authorizeRoles('Faculty'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Faculty. Access granted.',
    user: req.user,
  });
});

router.get('/student-only', verifyToken, authorizeRoles('Student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Student. Access granted.',
    user: req.user,
  });
});

router.get('/staff-only', verifyToken, authorizeRoles('Admin', 'Faculty'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Staff access granted.',
    user: req.user,
  });
});

module.exports = router;
