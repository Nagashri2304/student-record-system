/**
 * Official Semester Grade Card & PDF Export Service Tests
 * Requirement: SRS FR-08, NFR-02 (Compilation <= 3.0s); SAD SD-3; Test Plan TC-10
 * Issue: #14 [SP-5] FR-08: Semester Grade Card Generation & PDF Export Service
 * Author: Nidhi L (@nidhilokesh1)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const studentModel = require('../src/models/studentModel');
const gradeModel = require('../src/models/gradeModel');
const attendanceModel = require('../src/models/attendanceModel');
const { JWT_SECRET } = require('../src/middleware/roleAuth');

const generateToken = (role, user_id, email) => {
  return jwt.sign(
    {
      user_id: user_id || 1,
      email: email || `${role.toLowerCase()}@edutrack.edu`,
      role,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

describe('FR-08: Semester Grade Card Generation & PDF Export Service Tests (#14)', () => {
  let adminToken;
  let facultyToken;
  let student1Token;
  let student2Token;
  let parentToken;
  let unlinkedParentToken;

  beforeEach(() => {
    studentModel.seedMockStudents();
    gradeModel.seedMockGrades();
    attendanceModel.seedMockAttendance();

    adminToken = generateToken('Admin', 1, 'admin@edutrack.edu');
    facultyToken = generateToken('Faculty', 2, 'faculty@edutrack.edu');
    student1Token = generateToken('Student', 3, 'student@edutrack.edu');
    student2Token = generateToken('Student', 102, 'bhavya@edutrack.edu');
    parentToken = generateToken('Parent', 4, 'parent@edutrack.edu');
    unlinkedParentToken = generateToken('Parent', 99, 'unlinked@edutrack.edu');
  });

  describe('1. PDF Report Card Generation (GET /api/v1/students/:id/report-card)', () => {
    it('TC-10.1: Student successfully downloads own PDF semester grade card (HTTP 200 OK)', async () => {
      const startTime = Date.now();
      const res = await request(app)
        .get('/api/v1/students/1/report-card')
        .set('Authorization', `Bearer ${student1Token}`)
        .expect(200);

      const elapsed = Date.now() - startTime;

      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="GradeCard_/);
      expect(res.body).toBeInstanceOf(Buffer);
      // NFR-02: Compile within <= 3.0 seconds
      expect(elapsed).toBeLessThan(3000);
    });

    it('TC-10.2: Reject unauthenticated request without token (HTTP 401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/report-card')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied|No token provided|Authentication required/i);
    });

    it('TC-10.3: Zero IDOR leak: Student 2 cannot download Student 1 grade card (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/report-card')
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('TC-10.4: Linked Parent can download linked child grade card (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/report-card')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('TC-10.5: Unlinked Parent is rejected from downloading Student 2 grade card (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/students/2/report-card')
        .set('Authorization', `Bearer ${unlinkedParentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('TC-10.6: Faculty and Admin can inspect any student grade card (HTTP 200 OK)', async () => {
      await request(app)
        .get('/api/v1/students/1/report-card')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app)
        .get('/api/v1/students/1/report-card')
        .set('Authorization', `Bearer ${facultyToken}`)
        .expect(200);
    });

    it('TC-10.7: Nonexistent student ID returns HTTP 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/v1/students/9999/report-card')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
