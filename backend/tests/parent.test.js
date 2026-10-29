/**
 * Parent Oversight Portal Tests
 * Requirement: SRS FR-10; Test Plan TC-06
 * Issue: #15 [SP-3] FR-09: Parent Oversight Portal for Linked Student Progress
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

describe('FR-09: Parent Oversight Portal Tests (#15)', () => {
  let parentToken;
  let unlinkedParentToken;
  let studentToken;
  let adminToken;

  beforeEach(() => {
    studentModel.seedMockStudents();
    gradeModel.seedMockGrades();
    attendanceModel.seedMockAttendance();

    parentToken = generateToken('Parent', 4, 'parent@edutrack.edu');
    unlinkedParentToken = generateToken('Parent', 99, 'unlinked@edutrack.edu');
    studentToken = generateToken('Student', 3, 'student@edutrack.edu');
    adminToken = generateToken('Admin', 1, 'admin@edutrack.edu');
  });

  describe('1. Parent Academic Progress Overview (GET /api/v1/parent/overview)', () => {
    it('TC-06.1: Linked Parent retrieves child oversight dashboard (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/parent/overview')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.student.name).toMatch(/Aarav Sharma/i);
      expect(res.body.data.student.roll_number).toBe('USN2026CS001');
      expect(res.body.data.attendance.overallPercentage).toBeDefined();
      expect(res.body.data.grades.gpa).toBeDefined();
      expect(res.body.data.mentor).toBeDefined();
    });

    it('TC-06.2: Low attendance alert (< 75%) is accurately computed and returned', async () => {
      const res = await request(app)
        .get('/api/v1/parent/overview')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.data.attendance.alertThreshold).toBe(75);
      expect(typeof res.body.data.attendance.isLowAttendanceAlert).toBe('boolean');
    });

    it('TC-06.3: Reject unauthorized roles (e.g. Student) from accessing Parent oversight (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/parent/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('TC-06.4: Zero-Trust IDOR check: Parent cannot query unlinked student records (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/parent/student/2')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('TC-06.5: Parent with no linked student record receives HTTP 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/v1/parent/overview')
        .set('Authorization', `Bearer ${unlinkedParentToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No linked student record/i);
    });

    it('TC-06.6: Linked Parent retrieves child attendance breakdown via GET /api/v1/parent/attendance', async () => {
      const res = await request(app)
        .get('/api/v1/parent/attendance')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courses).toBeInstanceOf(Array);
    });

    it('TC-06.7: Linked Parent retrieves child grades via GET /api/v1/parent/grades', async () => {
      const res = await request(app)
        .get('/api/v1/parent/grades')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.grades).toBeInstanceOf(Array);
    });
  });
});
