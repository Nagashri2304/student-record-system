/**
 * Performance & System Optimization Controller
 * Requirement: SRS NFR-01 (API Response <= 200ms at 95th Percentile)
 * Issue: #19 [SP-3] NFR-01: Database Indexing, Query Optimization & Performance
 * Author: Kushitha K (@Kushitha30)
 */
const { getMetricsSummary, resetMetrics } = require('../middleware/performanceBenchmark');
const db = require('../config/db');

/**
 * GET /api/v1/performance/metrics
 * Inspect system response latency percentiles (p50, p95, p99) and SLA compliance
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const summary = getMetricsSummary();
    let dbStatus = 'In-Memory Mock Store Active';
    let dbIndexes = [];

    if (db.pool) {
      dbStatus = 'PostgreSQL Connection Pool Connected';
      try {
        const indexRes = await db.query(
          `SELECT tablename, indexname 
           FROM pg_indexes 
           WHERE schemaname = 'public' 
           ORDER BY tablename, indexname;`
        );
        dbIndexes = indexRes.rows;
      } catch (e) {
        dbIndexes = [];
      }
    }

    return res.status(200).json({
      success: true,
      message: 'System performance latency benchmarks and query metrics retrieved successfully.',
      data: {
        ...summary,
        database: {
          status: dbStatus,
          activeIndexesCount: dbIndexes.length,
          indexes: dbIndexes,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance benchmarks.',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/performance/reset
 * Reset in-memory performance metrics (Admin only)
 */
const resetPerformanceMetrics = (req, res) => {
  resetMetrics();
  return res.status(200).json({
    success: true,
    message: 'Performance metrics reset successfully.',
  });
};

module.exports = {
  getPerformanceMetrics,
  resetPerformanceMetrics,
};
