/**
 * Performance Monitoring & Latency Benchmark Middleware
 * Requirement: SRS NFR-01 (API Response <= 200ms at 95th Percentile)
 * Issue: #19 [SP-3] NFR-01: Database Indexing, Query Optimization & Performance
 * Author: Kushitha K (@Kushitha30)
 */

// In-memory latency and throughput metrics tracking
const latencyMetrics = {
  totalRequests: 0,
  durations: [], // Rolling window of request latencies in ms
  maxWindowSize: 1000,
  slowQueries: [], // Log of requests exceeding threshold
  thresholdMs: 200, // SRS NFR-01 SLA target
};

/**
 * Record a request response time
 * @param {string} method 
 * @param {string} path 
 * @param {number} durationMs 
 * @param {number} statusCode 
 */
const recordLatency = (method, path, durationMs, statusCode) => {
  latencyMetrics.totalRequests += 1;
  latencyMetrics.durations.push(durationMs);

  if (latencyMetrics.durations.length > latencyMetrics.maxWindowSize) {
    latencyMetrics.durations.shift();
  }

  if (durationMs > latencyMetrics.thresholdMs) {
    latencyMetrics.slowQueries.push({
      method,
      path,
      durationMs: Number(durationMs.toFixed(2)),
      statusCode,
      timestamp: new Date().toISOString(),
    });
    if (latencyMetrics.slowQueries.length > 100) {
      latencyMetrics.slowQueries.shift();
    }
  }
};

/**
 * Compute statistical percentiles (p50, p90, p95, p99) and average latency
 */
const getMetricsSummary = () => {
  const count = latencyMetrics.durations.length;
  if (count === 0) {
    return {
      totalRequests: latencyMetrics.totalRequests,
      sampleCount: 0,
      slaThresholdMs: latencyMetrics.thresholdMs,
      slaComplianceRate: '100%',
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p90LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      slowRequestsCount: latencyMetrics.slowQueries.length,
      recentSlowRequests: [],
    };
  }

  const sorted = [...latencyMetrics.durations].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, curr) => acc + curr, 0);
  const avg = Number((sum / count).toFixed(2));

  // Compute zero-based rank indices
  const p50 = Number(sorted[Math.min(count - 1, Math.floor((count - 1) * 0.50))].toFixed(2));
  const p90 = Number(sorted[Math.min(count - 1, Math.floor((count - 1) * 0.90))].toFixed(2));
  const p95 = Number(sorted[Math.min(count - 1, Math.floor((count - 1) * 0.95))].toFixed(2));
  const p99 = Number(sorted[Math.min(count - 1, Math.floor((count - 1) * 0.99))].toFixed(2));

  const compliantCount = sorted.filter((d) => d <= latencyMetrics.thresholdMs).length;
  const complianceRate = Number(((compliantCount / count) * 100).toFixed(2));

  return {
    totalRequests: latencyMetrics.totalRequests,
    sampleCount: count,
    slaThresholdMs: latencyMetrics.thresholdMs,
    slaComplianceRate: `${complianceRate}%`,
    avgLatencyMs: avg,
    p50LatencyMs: p50,
    p90LatencyMs: p90,
    p95LatencyMs: p95,
    p99LatencyMs: p99,
    slowRequestsCount: latencyMetrics.slowQueries.length,
    recentSlowRequests: latencyMetrics.slowQueries.slice(-5),
  };
};

/**
 * Express Middleware: intercepts request timing and injects X-Response-Time header
 */
const performanceBenchmark = (req, res, next) => {
  const start = process.hrtime.bigint();

  // Intercept writeHead / setHeader before response headers are flushed
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    return originalWriteHead.apply(this, args);
  };

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    // If request path is not reset endpoint, record latency
    if (!req.originalUrl || !req.originalUrl.includes('/performance/reset')) {
      recordLatency(req.method, req.originalUrl || req.url, durationMs, res.statusCode);
    }
  });

  next();
};

/**
 * Reset latency metrics (useful for isolated performance unit tests)
 */
const resetMetrics = () => {
  latencyMetrics.totalRequests = 0;
  latencyMetrics.durations = [];
  latencyMetrics.slowQueries = [];
};

module.exports = {
  performanceBenchmark,
  recordLatency,
  getMetricsSummary,
  resetMetrics,
};
