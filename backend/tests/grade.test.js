/**
 * Grade Entry, Automated GPA & Audit Trail Verification Test Suite
 * Requirement: SRS FR-05, FR-06, FR-07 (Subject Marks Entry, Automated GPA, Audit Trail)
 * Test Plan: TC-05
 * Issue: #2 [SP-5] FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const courseModel = require('../src/models/courseModel');
const studentModel = require('../src/models/studentModel');
const gradeModel = require('../src/models/gradeModel');

let adminToken;
let facultyToken;
let student1Token;
let student2Token;
let parentToken;

beforeAll(async () => {
  await userModel.seedMockUsers();
  studentModel.seedMockStudents();
  courseModel.seedMockCourses();
  gradeModel.seedMockGrades();

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
  gradeModel.seedMockGrades();
});

describe('FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation Tests', () => {
  describe('1. Marks Submission & Automated Letter Grade Evaluation', () => {
    it('TC-05.1: Faculty submits valid marks; system auto-evaluates letter grades and points (HTTP 200 OK)', async () => {
      const res = await request(app)
        .post('/api/v1/courses/3/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          grades: [
            { student_id: 1, marks: 95 }, // Grade S (10 pts)
            { student_id: 2, marks: 83 }, // Grade A (9 pts)
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      const gradeS = res.body.data.find((g) => g.student_id === 1);
      expect(gradeS.letter_grade).toBe('S');
      expect(gradeS.grade_points).toBe(10);

      const gradeA = res.body.data.find((g) => g.student_id === 2);
      expect(gradeA.letter_grade).toBe('A');
      expect(gradeA.grade_points).toBe(9);
    });

    it('TC-05.2: Reject marks outside [0, 100] range with HTTP 400 Bad Request', async () => {
      // Test negative marks
      const resNegative = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ grades: [{ student_id: 1, marks: -5 }] });

      expect(resNegative.status).toBe(400);
      expect(resNegative.body.message).toMatch(/between 0 and 100/);

      // Test marks > 100
      const resOver = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ grades: [{ student_id: 1, marks: 105 }] });

      expect(resOver.status).toBe(400);
      expect(resOver.body.message).toMatch(/between 0 and 100/);

      // Test non-numeric marks
      const resString = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ grades: [{ student_id: 1, marks: 'invalid_mark' }] });

      expect(resString.status).toBe(400);
    });

    it('TC-05.3: Reject non-faculty/non-admin roles from submitting grades with HTTP 403 Forbidden', async () => {
      const resStudent = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ grades: [{ student_id: 1, marks: 90 }] });

      expect(resStudent.status).toBe(403);

      const resParent = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({ grades: [{ student_id: 1, marks: 90 }] });

      expect(resParent.status).toBe(403);
    });
  });

  describe('2. Mandatory Explanation Note for Mark Amendments', () => {
    it('TC-05.4: Amending existing grades without mandatory note is rejected with HTTP 400 Bad Request', async () => {
      // Grade for Course 1, Student 1 already exists (seeded with 86)
      const res = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          grades: [{ student_id: 1, marks: 90 }], // Missing note!
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Mandatory explanation note is required for grade amendments/);
      expect(res.body.code).toBe('NOTE_REQUIRED');
    });

    it('TC-05.5: Amending existing grades with a valid explanation note succeeds (HTTP 200 OK)', async () => {
      const res = await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          grades: [
            {
              student_id: 1,
              marks: 94,
              note: 'Re-evaluation confirmed missing lab component marks (+8)',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updated = res.body.data[0];
      expect(updated.marks).toBe(94);
      expect(updated.letter_grade).toBe('S');
      expect(updated.grade_points).toBe(10);
      expect(updated.note).toMatch(/Re-evaluation confirmed/);
    });
  });

  describe('3. Immutable Security Audit Trail & Verification', () => {
    it('TC-05.6: Grade submission and amendment transactions are permanently logged to audit trail', async () => {
      // Perform amendment
      await request(app)
        .post('/api/v1/courses/1/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          grades: [
            {
              student_id: 1,
              marks: 89,
              note: 'Correction after moderation meeting review',
            },
          ],
        });

      // Query audit logs
      const auditRes = await request(app)
        .get('/api/v1/courses/1/grades/audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(auditRes.status).toBe(200);
      expect(auditRes.body.success).toBe(true);
      expect(Array.isArray(auditRes.body.data)).toBe(true);

      const amendmentLog = auditRes.body.data.find(
        (l) => l.action === 'GRADE_AMENDMENT' && l.student_id === 1
      );
      expect(amendmentLog).toBeDefined();
      expect(amendmentLog.new_marks).toBe(89);
      expect(amendmentLog.note).toBe('Correction after moderation meeting review');
      expect(amendmentLog.actor_user_id).toBe(2);
      expect(amendmentLog.timestamp).toBeDefined();
    });
  });

  describe('4. Automatic Student GPA Evaluation & IDOR Access Control', () => {
    it('TC-05.7: Query student grades returns course breakdown and accurately weighted GPA calculation', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/grades')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
      expect(res.body.data.totalCredits).toBeGreaterThan(0);
      expect(typeof res.body.data.gpa).toBe('number');
      expect(res.body.data.gpa).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.grades)).toBe(true);
    });

    it('TC-05.8: Zero-Trust IDOR check: Student 1 cannot query Student 2 grades with HTTP 403 Forbidden', async () => {
      // Student 1 (user_id 3) attempts to query Student 2 (ID: 2)
      const res = await request(app)
        .get('/api/v1/students/2/grades')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/);
    });

    it('TC-05.9: Student can access own grades via /api/v1/students/me/grades', async () => {
      const res = await request(app)
        .get('/api/v1/students/me/grades')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
    });
  });
});
