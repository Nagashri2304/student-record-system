/**
 * NFR-01 & TC-10: Database Performance, Indexing & Latency Benchmarks
 * Requirements: SRS NFR-01 (Response time <= 2.0s), NFR-02, NFR-03; Test Plan TC-10
 * Issues: #19 [SP-3] NFR-01: Database Indexing, Query Optimization & Performance
 *         #5 [SP-3] DEV-03: Comprehensive Test Suite Execution & IEEE Test Plan Verification
 * Author: Kushitha K (@Kushitha30), Nagashree R Patil (@Nagashri2304)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/middleware/roleAuth');

describe('NFR-01 & TC-10: Performance, Indexing & Query Latency Benchmarks (#19, #5)', () => {
  const facultyToken = jwt.sign(
    { user_id: 2, role: 'Faculty', email: 'faculty@edutrack.edu' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const studentToken = jwt.sign(
    { user_id: 3, role: 'Student', email: 'student@edutrack.edu' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('TC-10.1: Standard API responses complete in well under 2.0 seconds (NFR-01)', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/students/1')
      .set('Authorization', `Bearer ${studentToken}`);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(2000); // SRS NFR-01 requirement: < 2.0s
  });

  it('TC-10.2: Attendance calculation & query latency is < 1.0 second (FR-07, NFR-01)', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/students/1/attendance')
      .set('Authorization', `Bearer ${studentToken}`);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(1000); // Sub-second attendance aggregation
  });

  it('TC-10.3: Grade calculation & GPA evaluation completes in < 1.0 second (FR-05, NFR-01)', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/students/1/grades')
      .set('Authorization', `Bearer ${studentToken}`);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });

  it('TC-10.4: Concurrent query benchmark (20 simulated requests) responds with 100% success in < 2.0s', async () => {
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < 20; i++) {
      promises.push(
        request(app)
          .get('/api/v1/courses/1/attendance')
          .set('Authorization', `Bearer ${facultyToken}`)
      );
    }

    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });

    expect(totalTime).toBeLessThan(2000);
  });
});
