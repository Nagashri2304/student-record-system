/**
 * Performance & Database Optimization Unit Tests
 * Requirement: SRS NFR-01 (API Response <= 200ms at 95th Percentile)
 * Issue: #19 [SP-3] NFR-01: Database Indexing, Query Optimization & Performance
 * Author: Kushitha K (@Kushitha30)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const {
  recordLatency,
  getMetricsSummary,
  resetMetrics,
} = require('../src/middleware/performanceBenchmark');

describe('NFR-01: Database Indexing, Query Optimization & Performance Benchmarks (#19)', () => {
  let adminToken;

  beforeAll(async () => {
    await userModel.seedMockUsers();
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@edutrack.edu',
      password: 'Password@123',
    });
    adminToken = loginRes.body.token;
  });

  beforeEach(() => {
    resetMetrics();
  });

  describe('1. Response Latency & X-Response-Time Header Verification', () => {
    test('TC-NFR01.1: Health check responds with X-Response-Time header and duration < 200ms', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');

      // Check header presence and formatting
      const responseTimeHeader = res.headers['x-response-time'];
      expect(responseTimeHeader).toBeDefined();
      expect(responseTimeHeader).toMatch(/^\d+(\.\d+)?ms$/);

      const durationValue = parseFloat(responseTimeHeader.replace('ms', ''));
      expect(durationValue).toBeLessThan(200); // SRS NFR-01 SLA target
    });

    test('TC-NFR01.2: Student list API responds within SLA threshold (< 200ms)', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const responseTimeHeader = res.headers['x-response-time'];
      expect(responseTimeHeader).toBeDefined();
      const durationValue = parseFloat(responseTimeHeader.replace('ms', ''));
      expect(durationValue).toBeLessThan(200);
    });

    test('TC-NFR01.3: Course catalog retrieval responds within SLA threshold (< 200ms)', async () => {
      const res = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const responseTimeHeader = res.headers['x-response-time'];
      expect(responseTimeHeader).toBeDefined();
      const durationValue = parseFloat(responseTimeHeader.replace('ms', ''));
      expect(durationValue).toBeLessThan(200);
    });
  });

  describe('2. Performance Statistical Aggregation & Percentiles', () => {
    test('TC-NFR01.4: Accurately compute p50, p90, p95, p99 percentiles and SLA compliance rate', () => {
      // Simulate 100 request durations (95 requests at 20-50ms, 5 requests at 210-250ms)
      for (let i = 0; i < 95; i++) {
        recordLatency('GET', '/api/v1/courses', 20 + (i % 30), 200);
      }
      for (let i = 0; i < 5; i++) {
        recordLatency('POST', '/api/v1/courses', 210 + i * 5, 201);
      }

      const summary = getMetricsSummary();
      expect(summary.totalRequests).toBe(100);
      expect(summary.sampleCount).toBe(100);
      expect(summary.slaThresholdMs).toBe(200);
      expect(summary.slaComplianceRate).toBe('95%'); // 95 out of 100 <= 200ms
      expect(summary.p50LatencyMs).toBeLessThanOrEqual(50);
      expect(summary.p95LatencyMs).toBeLessThanOrEqual(200);
      expect(summary.slowRequestsCount).toBe(5);
      expect(summary.recentSlowRequests.length).toBe(5);
    });

    test('TC-NFR01.5: Return default clean structure when no request metrics recorded', () => {
      resetMetrics();
      const summary = getMetricsSummary();
      expect(summary.totalRequests).toBe(0);
      expect(summary.sampleCount).toBe(0);
      expect(summary.slaComplianceRate).toBe('100%');
      expect(summary.avgLatencyMs).toBe(0);
    });
  });

  describe('3. Performance Metrics Endpoint (/api/v1/performance/metrics)', () => {
    test('TC-NFR01.6: GET /api/v1/performance/metrics returns live stats and database index profile', async () => {
      // Record a few test pings
      recordLatency('GET', '/health', 15.4, 200);
      recordLatency('GET', '/api/v1/students', 32.1, 200);

      const res = await request(app).get('/api/v1/performance/metrics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slaThresholdMs).toBe(200);
      expect(res.body.data.database).toBeDefined();
      expect(res.body.data.database.status).toBeDefined();
    });

    test('TC-NFR01.7: POST /api/v1/performance/reset clears metrics for Admin', async () => {
      recordLatency('GET', '/health', 50, 200);
      expect(getMetricsSummary().totalRequests).toBeGreaterThan(0);

      const res = await request(app)
        .post('/api/v1/performance/reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(getMetricsSummary().totalRequests).toBe(0);
    });

    test('TC-NFR01.8: Reject unauthenticated user from resetting performance benchmarks', async () => {
      const res = await request(app).post('/api/v1/performance/reset');
      expect(res.status).toBe(401);
    });
  });
});
