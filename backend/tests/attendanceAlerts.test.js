/**
 * Real-Time Attendance Percentage Engine & Low Attendance Alert (<75%) Test Suite
 * Requirement: SRS FR-07, NFR-08; Test Plan TC-04, TC-07
 * Issue: #4 [SP-3] FR-07: Attendance Percentage Engine & Low Attendance Alert (<75%) System
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const studentModel = require('../src/models/studentModel');
const courseModel = require('../src/models/courseModel');
const attendanceModel = require('../src/models/attendanceModel');

let adminToken;
let facultyToken;
let student1Token;
let student2Token;
let parentToken;

beforeAll(async () => {
  await userModel.seedMockUsers();
  studentModel.seedMockStudents();
  courseModel.seedMockCourses();
  attendanceModel.seedMockAttendance();

  // Log in as each role to acquire tokens
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

  const student1Res = await request(app).post('/api/v1/auth/login').send({
    email: 'student@edutrack.edu',
    password: 'Password@123',
  });
  student1Token = student1Res.body.token;

  const student2Res = await request(app).post('/api/v1/auth/login').send({
    email: 'student2@edutrack.edu',
    password: 'Password@123',
  });
  student2Token = student2Res.body.token;

  const parentRes = await request(app).post('/api/v1/auth/login').send({
    email: 'parent@edutrack.edu',
    password: 'Password@123',
  });
  parentToken = parentRes.body.token;
});

beforeEach(() => {
  attendanceModel.seedMockAttendance();
});

describe('FR-07: Attendance Percentage Engine & Low Attendance Alert (<75%) System Tests', () => {
  describe('1. Real-Time Shortage Detection (<75% Threshold)', () => {
    it('TC-07.1: Query all low attendance alerts returns students below statutory 75% threshold (HTTP 200 OK)', async () => {
      // In seed: student 2 has 1 session with status 'absent' -> 0% attendance (< 75%)
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);

      const student2Alert = res.body.data.find((a) => a.student_id === 2);
      expect(student2Alert).toBeDefined();
      expect(student2Alert.attendance_percentage).toBeLessThan(75.0);
      expect(student2Alert.is_shortage).toBe(true);
      expect(student2Alert.warning_level).toBe('ATTENDANCE_SHORTAGE_WARNING');
      expect(student2Alert.warning_banner).toMatch(/Warning: Attendance is/);
    });

    it('TC-07.2: Debarment risk is classified based on severity threshold (CRITICAL <65%, HIGH <75%)', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const criticalAlert = res.body.data.find((a) => a.attendance_percentage < 65.0);
      if (criticalAlert) {
        expect(criticalAlert.debarment_risk).toBe('CRITICAL');
      }
    });

    it('TC-07.3: Calculate deficit sessions needed to recover to 75% attendance', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      const alert = res.body.data[0];
      expect(alert.classes_needed_to_reach_75).toBeGreaterThanOrEqual(1);
    });

    it('TC-07.4: Filter low attendance alerts by course_id', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts?course_id=1')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const alert of res.body.data) {
        expect(alert.course_id).toBe(1);
      }
    });

    it('TC-07.5: Filter low attendance alerts with custom threshold query parameter', async () => {
      // With threshold 100%, even student 1 (100% attended) might be included if threshold > 100%
      const res = await request(app)
        .get('/api/v1/attendance/alerts?threshold=50')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      for (const alert of res.body.data) {
        expect(alert.attendance_percentage).toBeLessThan(50);
      }
    });

    it('TC-07.6: Course-specific route GET /api/v1/courses/:id/attendance/alerts returns alerts for the course', async () => {
      const res = await request(app)
        .get('/api/v1/courses/1/attendance/alerts')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.course_id).toBe(1);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. Automated Alert Dispatch (SMS/Email Mock Notifications)', () => {
    it('TC-07.7: Faculty dispatches automated attendance shortage warning notifications (HTTP 200 OK)', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/alerts/dispatch')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ threshold: 75.0 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispatched_count).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.data.dispatches)).toBe(true);

      const firstDispatch = res.body.data.dispatches[0];
      expect(firstDispatch.channel).toBe('SMS_AND_EMAIL');
      expect(firstDispatch.status).toBe('DELIVERED');
      expect(firstDispatch.message).toMatch(/URGENT ACADEMIC NOTICE/);
    });
  });

  describe('3. Student Alert Status & Broken Object Authorization (IDOR) Checks', () => {
    it('TC-07.8: Student 1 can check their own shortage status via /api/v1/students/me/attendance-alert', async () => {
      const res = await request(app)
        .get('/api/v1/students/me/attendance-alert')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student_id).toBe(1);
      expect(typeof res.body.overall_percentage).toBe('number');
      expect(res.body.is_shortage).toBe(false);
      expect(res.body.warning_banner).toBeNull();
    });

    it('TC-07.9: Student 2 with 0% attendance receives active warning banner and course shortage list', async () => {
      const res = await request(app)
        .get('/api/v1/students/me/attendance-alert')
        .set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student_id).toBe(2);
      expect(res.body.is_shortage).toBe(true);
      expect(res.body.warning_banner).toMatch(/Warning: Overall attendance is/);
      expect(res.body.course_alerts.length).toBeGreaterThan(0);
    });

    it('TC-07.10: Zero-Trust IDOR check: Student 1 cannot view Student 2 shortage alert (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/students/2/attendance-alert')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/);
    });

    it('TC-07.11: Parent can view linked child alert status (HTTP 200 OK)', async () => {
      // Parent is linked to Student 1
      const res = await request(app)
        .get('/api/v1/students/1/attendance-alert')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student_id).toBe(1);
    });

    it('TC-07.12: Parent cannot view unlinked student alert status (HTTP 403 Forbidden)', async () => {
      // Parent is not linked to Student 2
      const res = await request(app)
        .get('/api/v1/students/2/attendance-alert')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/);
    });
  });

  describe('4. Role-Based Access Control on Administrative Alert Routes', () => {
    it('TC-07.13: Students cannot query global low attendance alerts (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/attendance/alerts')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
    });

    it('TC-07.14: Parents cannot dispatch automated shortage warnings (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/alerts/dispatch')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({ threshold: 75.0 });

      expect(res.status).toBe(403);
    });
  });
});
