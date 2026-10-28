/**
 * Attendance Subsystem & 24-Hour Edit Limit Verification Test Suite
 * Requirement: SRS FR-04 (Daily Attendance Marking & Session Validation Engine)
 * Test Plan: TC-04
 * Issue: #1 [SP-5] FR-04: Daily Attendance Marking & Session Validation Engine
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const courseModel = require('../src/models/courseModel');
const studentModel = require('../src/models/studentModel');
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
  await courseModel.enrollStudent({
    student_id: 2,
    course_id: 1,
    semester: 3,
    academic_year: '2025-2026',
  });

  // Generate tokens
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

describe('FR-04: Daily Attendance Marking & Session Validation Engine Tests', () => {
  describe('1. Batch Attendance Submission (POST /api/v1/courses/:id/attendance)', () => {
    it('TC-04.1: Faculty successfully records batch attendance with present, absent, late flags (HTTP 201)', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          session_date: '2026-10-22',
          period: 2,
          topic: 'Binary Search Trees & Balancing',
          records: [
            { student_id: 1, status: 'present', remarks: 'Active participant' },
            { student_id: 2, status: 'late', remarks: 'Joined 10 mins late' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.session_id).toBeDefined();
      expect(res.body.data.records).toHaveLength(2);
      expect(res.body.data.summary.total).toBe(2);
      expect(res.body.data.summary.present).toBe(1);
      expect(res.body.data.summary.late).toBe(1);
      expect(res.body.data.summary.absent).toBe(0);
      expect(res.body.data.summary.attendanceRate).toBe(100);
    });

    it('TC-04.2: Session timestamp and instructor identifier are accurately recorded', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          session_date: '2026-10-22',
          period: 1,
          topic: 'Heap Sort Algorithm',
          records: [{ student_id: 1, status: 'present' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.faculty_user_id).toBe(2);
      expect(res.body.data.session_date).toBe('2026-10-22');
      expect(res.body.data.period).toBe(1);
      expect(res.body.data.topic).toBe('Heap Sort Algorithm');
    });

    it('TC-04.3: Reject attendance submission with invalid status with HTTP 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          session_date: '2026-10-22',
          records: [{ student_id: 1, status: 'unknown_status' }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid attendance status/);
    });

    it('accepts the SRS excused status while preserving late attendance', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ records: [{ student_id: 1, status: 'excused' }] });

      expect(res.status).toBe(201);
      expect(res.body.data.records[0].status).toBe('excused');
    });

    it('rejects a student who is not enrolled in the selected course', async () => {
      const res = await request(app)
        .post('/api/v1/courses/2/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ records: [{ student_id: 2, status: 'present' }] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not enrolled/);
    });

    it('rejects a faculty member who is not assigned to the selected course', async () => {
      const res = await request(app)
        .post('/api/v1/courses/3/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ records: [{ student_id: 1, status: 'present' }] });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not assigned/);
    });

    it('rejects invalid dates and non-positive periods', async () => {
      const invalidDate = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ session_date: '2026-02-30', records: [{ student_id: 1, status: 'present' }] });
      const invalidPeriod = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ period: 0, records: [{ student_id: 1, status: 'present' }] });

      expect(invalidDate.status).toBe(400);
      expect(invalidPeriod.status).toBe(400);
    });

    it('TC-04.4: Reject attendance submission with duplicate student_id in same batch with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          records: [
            { student_id: 1, status: 'present' },
            { student_id: 1, status: 'absent' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Duplicate attendance record/);
    });

    it('TC-04.5: Reject non-faculty/non-admin roles from marking attendance with HTTP 403 Forbidden', async () => {
      const resStudent = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ records: [{ student_id: 1, status: 'present' }] });

      expect(resStudent.status).toBe(403);

      const resParent = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({ records: [{ student_id: 1, status: 'present' }] });

      expect(resParent.status).toBe(403);
    });
  });

  describe('2. 24-Hour Edit Limit Enforcement on Session Records', () => {
    it('TC-04.6: Faculty can update attendance session within 24 hours of creation (HTTP 200 OK)', async () => {
      // Create session now
      const createRes = await request(app)
        .post('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          session_date: '2026-10-22',
          period: 1,
          topic: 'Graph Traversal',
          records: [{ student_id: 1, status: 'absent' }],
        });

      const sessionId = createRes.body.data.session_id;

      // Update within 24 hours
      const updateRes = await request(app)
        .put(`/api/v1/courses/1/attendance/${sessionId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          topic: 'Graph Traversal (Updated)',
          records: [{ student_id: 1, status: 'present', remarks: 'Late arrival corrected' }],
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.records[0].status).toBe('present');
      expect(updateRes.body.data.topic).toBe('Graph Traversal (Updated)');
    });

    it('TC-04.7: Enforce 24-hour edit limit: Rejects modifications to sessions older than 24h with HTTP 403', async () => {
      // Create a session with creation timestamp 25 hours ago
      const pastTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const oldSession = {
        course_id: 1,
        faculty_user_id: 2,
        session_date: '2026-10-20',
        period: 1,
        topic: 'Past Session',
        records: [{ student_id: 1, status: 'absent' }],
      };

      const created = await attendanceModel.createSession(oldSession);
      // Manually backdate created_at in memory
      attendanceModel.inMemorySessions.get(created.session_id).created_at = pastTime;

      // Attempt update
      const res = await request(app)
        .put(`/api/v1/courses/1/attendance/${created.session_id}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          records: [{ student_id: 1, status: 'present' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot be modified after 24 hours/);
      expect(res.body.code).toBe('EDIT_WINDOW_EXPIRED');
    });
  });

  describe('3. Attendance Retrieval & Real-Time Aggregator Engine', () => {
    it('TC-04.8: Query course attendance sessions via GET /api/v1/courses/:id/attendance (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/courses/1/attendance')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('TC-04.9: Query student attendance summary via GET /api/v1/students/:id/attendance (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/attendance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
      expect(res.body.data.totalSessions).toBeDefined();
      expect(res.body.data.overallPercentage).toBeDefined();
      expect(Array.isArray(res.body.data.courses)).toBe(true);
    });

    it('TC-04.10: Zero-Trust IDOR check: Student cannot query another student attendance summary (HTTP 403 Forbidden)', async () => {
      // Student 1 (user_id 3) attempts to query Student 2 (ID: 2)
      const res = await request(app)
        .get('/api/v1/students/2/attendance')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/);
    });
  });
});
