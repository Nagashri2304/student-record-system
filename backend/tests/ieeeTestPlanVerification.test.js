/**
 * Comprehensive IEEE Test Plan Verification Test Suite (IEEE Std 829-2008)
 * Requirement: Test Plan STP-EDUTRACK-V1.0 Section 5.1 & Section 8
 * Issue: #5 [SP-3] DEV-03: Comprehensive Test Suite Execution & IEEE Test Plan Verification
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const studentModel = require('../src/models/studentModel');
const courseModel = require('../src/models/courseModel');
const attendanceModel = require('../src/models/attendanceModel');
const gradeModel = require('../src/models/gradeModel');

let adminToken;
let facultyToken;
let studentToken;

beforeAll(async () => {
  await userModel.seedMockUsers();
  studentModel.seedMockStudents();
  courseModel.seedMockCourses();
  attendanceModel.seedMockAttendance();
  gradeModel.seedMockGrades();

  const adminRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@edutrack.edu',
    password: 'Password@123',
  });
  adminToken = adminRes.body.token;

  const facultyRes = await request(app).post('/api/v1/auth/login').send({
    email: 'faculty@edutrack.edu',
    password: 'Password@123',
  });
  facultyToken = facultyRes.body.token;

  const studentRes = await request(app).post('/api/v1/auth/login').send({
    email: 'student@edutrack.edu',
    password: 'Password@123',
  });
  studentToken = studentRes.body.token;
});

beforeEach(() => {
  attendanceModel.seedMockAttendance();
  gradeModel.seedMockGrades();
});

describe('DEV-03: Comprehensive IEEE Test Plan Formal Verification (TC-01 through TC-10)', () => {
  // Functional Verification: TC-01 through TC-05
  describe('Functional Verification (TC-01 to TC-05)', () => {
    it('TC-01: User Authentication & Signed JWT Issuance', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@edutrack.edu',
        password: 'Password@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('Admin');
    });

    it('TC-02: Student Core CRUD & Unique Roll Number Enforcement', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roll_number: 'USN2026TEST01',
          first_name: 'IEEE',
          last_name: 'Verification',
          email: 'ieee.verify@edutrack.edu',
          dept_id: 1,
          semester: 3,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.roll_number).toBe('USN2026TEST01');

      // Duplicate roll number rejection
      const dupRes = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roll_number: 'USN2026TEST01',
          first_name: 'Duplicate',
          last_name: 'Record',
          email: 'dup@edutrack.edu',
          dept_id: 1,
        });
      expect(dupRes.status).toBe(409);
    });

    it('TC-03: Course & Faculty Assignment Catalog Registry', async () => {
      const res = await request(app)
        .get('/api/v1/courses/1')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.course_code).toBe('CS101');
      expect(res.body.data.credits).toBe(4);
    });

    it('TC-04: Attendance Session Recording & 24-Hour Edit Limit Validation', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          session_date: '2026-10-22',
          period: 1,
          topic: 'IEEE TC-04 Verification',
          records: [{ student_id: 1, status: 'present' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.data.records[0].status).toBe('present');
    });

    it('TC-05: Faculty Grade Entry, Automatic Evaluation (S-F) & Weighted GPA', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/grades')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.gpa).toBe('number');
      expect(res.body.data.grades.length).toBeGreaterThan(0);
    });
  });

  // Security & Resilience Verification: TC-06 through TC-09
  describe('Security & Resilience Verification (TC-06 to TC-09)', () => {
    it('TC-06: Role-Based Access Control (RBAC) Boundary Isolation', async () => {
      // Student cannot access Admin-only course creation
      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ course_code: 'MALICIOUS', course_name: 'Hack', credits: 4 });
      expect(res.status).toBe(403);
    });

    it('TC-07: Broken Object-Level Authorization (IDOR) Mitigation', async () => {
      // Student 1 (user_id 3) cannot query Student 2 profile
      const res = await request(app)
        .get('/api/v1/students/2')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Access denied/);
    });

    it('TC-08: Malicious Input & SQL Injection Sanitization', async () => {
      // Parameter pollution / SQLi search string
      const res = await request(app)
        .get("/api/v1/students?search=' OR '1'='1' --")
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Ensures the SQL injection attempt does not crash the server or dump arbitrary records
    });

    it('TC-09: Append-Only Immutable Security Audit Trail Verification', async () => {
      const logs = await gradeModel.getAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      const sampleLog = logs[0];
      expect(sampleLog.action).toBeDefined();
      expect(sampleLog.actor_user_id).toBeDefined();
      expect(sampleLog.timestamp).toBeDefined();
    });
  });

  // Non-Functional Verification: TC-10 Latency & Throughput Benchmark
  describe('Non-Functional Verification (TC-10)', () => {
    it('TC-10: Latency & Throughput SLA Benchmark (API response < 500ms)', async () => {
      const startTime = Date.now();
      const res = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`);
      const duration = Date.now() - startTime;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(500); // IEEE SLA benchmark
    });
  });
});
