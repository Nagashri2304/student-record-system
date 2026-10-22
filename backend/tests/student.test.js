/**
 * Integration & Security Tests for Student Profile Management & IDOR Prevention
 * Requirement: SRS FR-02 (Student Profile CRUD), SEC-01, SEC-08 / NFR-06 (Object Authorization)
 * Test Plan: TC-02, TC-07
 * Issue: #8 [SP-5] FR-02: Student Profile Management & Enrollment Lifecycle (CRUD)
 * Author: Kushitha K (@Kushitha30)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
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

describe('FR-02 & SEC-08: Student Profile Management & IDOR Prevention Tests', () => {
  let adminToken;
  let facultyToken;
  let student1Token;
  let student2Token;
  let parentToken;

  beforeEach(() => {
    studentModel.seedMockStudents();
    adminToken = generateToken('Admin', 1, 'admin@edutrack.edu');
    facultyToken = generateToken('Faculty', 2, 'faculty@edutrack.edu');
    student1Token = generateToken('Student', 3, 'student@edutrack.edu'); // student_id = 1
    student2Token = generateToken('Student', 102, 'bhavya@edutrack.edu'); // student_id = 2
    parentToken = generateToken('Parent', 4, 'parent@edutrack.edu'); // linked to student_id = 1
  });

  describe('1. TC-02: Student Profile CRUD & Unique Roll Number Enforcement', () => {
    test('TC-02.1: Admin successfully creates new student record (HTTP 201 Created)', async () => {
      const payload = {
        roll_number: 'USN2026CS005',
        first_name: 'Chandana',
        last_name: 'Gowda',
        email: 'chandana@edutrack.edu',
        dept_id: 1,
        semester: 2,
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roll_number).toBe('USN2026CS005');
      expect(res.body.data.first_name).toBe('Chandana');
    });

    test('TC-02.2: Duplicate roll number is rejected with HTTP 409 Conflict', async () => {
      const duplicatePayload = {
        roll_number: 'USN2026CS001', // Already exists in mock seed
        first_name: 'Duplicate',
        last_name: 'Student',
        email: 'diff_email@edutrack.edu',
        dept_id: 1,
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicatePayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Roll number already exists/i);
    });

    test('TC-02.3: Reject student creation when mandatory fields are missing (HTTP 400 Bad Request)', async () => {
      const invalidPayload = {
        first_name: 'MissingRoll',
        email: 'missing@edutrack.edu',
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Missing required fields/i);
    });

    test('TC-02.4: Reject non-admin role from creating student (HTTP 403 Forbidden)', async () => {
      const payload = {
        roll_number: 'USN2026CS009',
        first_name: 'Unauthorized',
        last_name: 'Create',
        email: 'unauth@edutrack.edu',
        dept_id: 1,
      };

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('TC-02.5: Admin can update existing student profile (HTTP 200 OK)', async () => {
      const res = await request(app)
        .put('/api/v1/students/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ first_name: 'Aarav Updated', semester: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.first_name).toBe('Aarav Updated');
      expect(res.body.data.semester).toBe(5);
    });

    test('TC-02.6: Admin can archive student (HTTP 200 OK)', async () => {
      const res = await request(app)
        .delete('/api/v1/students/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_active).toBe(false);
    });
  });

  describe('2. TC-07: Broken Object-Level Authorization (IDOR) Prevention on Student Profile', () => {
    test('TC-07.1: Student 1 can access own profile via GET /api/v1/students/me (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/me')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
      expect(res.body.data.email).toBe('student@edutrack.edu');
    });

    test('TC-07.2: Student 1 can access own profile via ID /api/v1/students/1 (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
    });

    test('TC-07.3: Student 1 attempting to view Student 2 (ID: 2) receives HTTP 403 Forbidden (Zero IDOR leak)', async () => {
      const res = await request(app)
        .get('/api/v1/students/2')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    test('TC-07.4: Parent linked to Student 1 can access Student 1 record (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/1')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student_id).toBe(1);
    });

    test('TC-07.5: Parent attempting to view unlinked Student 2 receives HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/students/2')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized to view records of unlinked students/i);
    });

    test('TC-07.6: Faculty and Admin can inspect any student record (HTTP 200 OK)', async () => {
      const facultyRes = await request(app)
        .get('/api/v1/students/1')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(facultyRes.status).toBe(200);

      const adminRes = await request(app)
        .get('/api/v1/students/2')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);
    });
  });

  describe('3. Student Listing, Search & Department Metadata', () => {
    test('TC-02.7: List students with pagination and search query', async () => {
      const res = await request(app)
        .get('/api/v1/students?search=Aarav')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].first_name).toBe('Aarav');
    });

    test('TC-02.8: Students cannot access the full students list (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(403);
    });

    test('TC-02.9: Fetch departments metadata (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/students/meta/departments')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
