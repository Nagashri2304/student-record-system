/**
 * Integration & Security Tests for Course Catalog & Faculty Allocation
 * Requirement: SRS FR-03 (Course Catalog Management), FR-04 (Faculty Allocation & Enrollments)
 * Test Plan: TC-02, TC-03
 * Issue: #9 [SP-3] FR-03: Course & Faculty Assignment Catalog Management
 * Author: Kushitha K (@Kushitha30)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const courseModel = require('../src/models/courseModel');
const studentModel = require('../src/models/studentModel');
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

describe('FR-03 & FR-04: Course Catalog & Enrollment Tests', () => {
  let adminToken;
  let facultyToken;
  let student1Token;

  beforeEach(() => {
    courseModel.seedMockCourses();
    studentModel.seedMockStudents();
    adminToken = generateToken('Admin', 1, 'admin@edutrack.edu');
    facultyToken = generateToken('Faculty', 2, 'faculty@edutrack.edu');
    student1Token = generateToken('Student', 3, 'student@edutrack.edu');
  });

  describe('1. Course Catalog Management (FR-03)', () => {
    test('TC-03.1: Admin creates a new course (HTTP 201 Created)', async () => {
      const payload = {
        course_code: 'CS201',
        course_name: 'Operating Systems',
        credits: 4,
        dept_id: 1,
        semester: 4,
      };

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course_code).toBe('CS201');
      expect(res.body.data.credits).toBe(4);
    });

    test('TC-03.2: Reject duplicate course code with HTTP 409 Conflict', async () => {
      const duplicatePayload = {
        course_code: 'CS101', // Already exists in mock seed
        course_name: 'Duplicate DSA',
        credits: 4,
        dept_id: 1,
      };

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicatePayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Course code already exists/i);
    });

    test('TC-03.3: Reject course creation with invalid credits (HTTP 400 Bad Request)', async () => {
      const invalidPayload = {
        course_code: 'CS999',
        course_name: 'Invalid Course',
        credits: 15, // Out of allowed bounds [1, 10]
        dept_id: 1,
      };

      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('TC-03.4: Students and Faculty can view the course catalog (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    test('TC-03.5: Admin updates course instructor allocation (HTTP 200 OK)', async () => {
      const res = await request(app)
        .put('/api/v1/courses/3')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ faculty_user_id: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.faculty_user_id).toBe(2);
    });
  });

  describe('2. Student Course Enrollment & Roster (FR-04)', () => {
    test('TC-03.6: Enroll student in a course (HTTP 201 Created)', async () => {
      const payload = {
        student_id: 2,
        semester: 3,
        academic_year: '2025-2026',
      };

      const res = await request(app)
        .post('/api/v1/courses/1/enroll')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(2);
      expect(res.body.data.course_id).toBe(1);
    });

    test('TC-03.7: Reject duplicate enrollment in the same semester with HTTP 409 Conflict', async () => {
      const duplicatePayload = {
        student_id: 1, // Student 1 is already enrolled in CS101 for sem 3 in seed
        semester: 3,
        academic_year: '2025-2026',
      };

      const res = await request(app)
        .post('/api/v1/courses/1/enroll')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(duplicatePayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('TC-03.8: Faculty views course enrollment roster (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/courses/1/roster')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].roll_number).toBe('USN2026CS001');
    });

    test('TC-03.9: Student views their own course enrollments (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1/enrollments')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });
});
