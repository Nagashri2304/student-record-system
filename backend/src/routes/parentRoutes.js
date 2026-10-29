/**
 * Parent Oversight Portal Routes
 * Requirement: SRS FR-10; Test Plan TC-06
 * Issue: #15 [SP-3] FR-09: Parent Oversight Portal for Linked Student Progress
 * Author: Nidhi L (@nidhilokesh1)
 */
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');

// Optional auth helper to allow both authenticated access and demo mode preview
const optionalParentAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, (err) => {
      if (err) return next(err);
      return authorizeRoles('Parent', 'Admin')(req, res, next);
    });
  }
  // Fallback demo mock user
  req.user = { user_id: 4, role: 'Parent', email: 'parent@edutrack.edu' };
  next();
};

// Parent oversight endpoints
router.get('/overview', optionalParentAuth, parentController.getChildOverview);
router.get('/attendance', optionalParentAuth, parentController.getChildAttendance);
router.get('/grades', optionalParentAuth, parentController.getChildGrades);
router.get('/student/:id', verifyToken, authorizeRoles('Parent', 'Admin'), parentController.getChildOverview);

module.exports = router;
