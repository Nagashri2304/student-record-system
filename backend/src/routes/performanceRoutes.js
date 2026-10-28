/**
 * Performance Benchmark & Optimization Routes
 * Requirement: SRS NFR-01 (API Response <= 200ms at 95th Percentile)
 * Issue: #19 [SP-3] NFR-01: Database Indexing, Query Optimization & Performance
 * Author: Kushitha K (@Kushitha30)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const performanceController = require('../controllers/performanceController');

const router = express.Router();

// Public / Health check access for DevOps monitoring
router.get('/metrics', performanceController.getPerformanceMetrics);

// Reset metrics - Restricted to Administrator
router.post('/reset', verifyToken, authorizeRoles('Admin'), performanceController.resetPerformanceMetrics);

module.exports = router;
