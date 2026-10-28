/**
 * Academic Discrepancy & Grade Grievance Resolution Workflow Test Suite
 * Requirement: SRS FR-10, FR-15; Architecture SAD Component C9 (Grievance Service)
 * Issue: #16 [SP-3] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow
 * Acceptance Criteria:
 *   1. Implement POST /api/v1/grievances (creates ticket in Open state).
 *   2. Allow assigned instructor to update status to Resolved via PATCH /api/v1/grievances/:id.
 *   3. Display resolution notes to the student.
 * Author: Kushitha K (@Kushitha30)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const studentModel = require('../src/models/studentModel');
const courseModel = require('../src/models/courseModel');
const grievanceModel = require('../src/models/grievanceModel');

let adminToken;
let facultyToken;
let faculty2Token;
let student1Token;
let student2Token;
let parent1Token;

beforeAll(async () => {
  await userModel.seedMockUsers();
  studentModel.seedMockStudents();
  courseModel.seedMockCourses();
  grievanceModel.seedMockGrievances();

  // Create student2 user so student2 can login
  await userModel.createUser({
    user_id: 102,
    email: 'bhavya@edutrack.edu',
    password: 'Password@123',
    role: 'Student',
  });

  // Tokens
  const adminRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@edutrack.edu',
    password: 'Password@123',
  });
  adminToken = adminRes.body.token;

  const facultyRes = await request(app).post('/api/v1/auth/login').send({
    email: 'faculty@edutrack.edu', // user_id: 2 (assigned to course 1 CS101)
    password: 'Password@123',
  });
  facultyToken = facultyRes.body.token;

  // Additional faculty member (unassigned to course 1)
  await userModel.createUser({
    email: 'faculty2@edutrack.edu',
    password: 'Password@123',
    role: 'Faculty',
  });
  const faculty2Res = await request(app).post('/api/v1/auth/login').send({
    email: 'faculty2@edutrack.edu',
    password: 'Password@123',
  });
  faculty2Token = faculty2Res.body.token;

  const student1Res = await request(app).post('/api/v1/auth/login').send({
    email: 'student@edutrack.edu', // user_id: 3 -> student_id: 1
    password: 'Password@123',
  });
  student1Token = student1Res.body.token;

  const student2Res = await request(app).post('/api/v1/auth/login').send({
    email: 'bhavya@edutrack.edu', // user_id: 102 -> student_id: 2
    password: 'Password@123',
  });
  student2Token = student2Res.body.token;

  const parent1Res = await request(app).post('/api/v1/auth/login').send({
    email: 'parent@edutrack.edu', // user_id: 4 -> linked to student 1
    password: 'Password@123',
  });
  parent1Token = parent1Res.body.token;
});

describe('FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow Tests (#16)', () => {
  describe('1. Grievance Ticket Submission (POST /api/v1/grievances)', () => {
    it('TC-10.1: Student successfully creates a grievance ticket in Open state (HTTP 201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          course_id: 1,
          grievance_type: 'grade',
          title: 'Midterm Marks Calculation Discrepancy',
          description: 'Question 3 marks (4 pts) were not summed into the final total.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe('Open');
      expect(res.body.data.student_id).toBe(1);
      expect(res.body.data.course_id).toBe(1);
      expect(res.body.data.title).toBe('Midterm Marks Calculation Discrepancy');
      expect(res.body.data.description).toBe('Question 3 marks (4 pts) were not summed into the final total.');
      expect(res.body.data.resolution_notes).toBeNull();
    });

    it('TC-10.2: Reject grievance creation when title or description is missing (HTTP 400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          course_id: 1,
          grievance_type: 'attendance',
          title: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('TC-10.3: Reject grievance creation for nonexistent course (HTTP 404 Not Found)', async () => {
      const res = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          course_id: 9999,
          title: 'Invalid Course Test',
          description: 'Testing non-existent course error handling.',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('TC-10.4: Reject unauthenticated user from lodging grievance (HTTP 401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/v1/grievances')
        .send({
          course_id: 1,
          title: 'Unauthorized test',
          description: 'Testing 401 response.',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('2. Grievance Status Update & Resolution Workflow (PATCH /api/v1/grievances/:id)', () => {
    let testGrievanceId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          course_id: 1,
          grievance_type: 'grade',
          title: 'Quiz 2 Attendance Mark Error',
          description: 'Was marked absent during Quiz 2 session.',
        });
      testGrievanceId = createRes.body.data.grievance_id;
    });

    it('TC-10.5: Assigned instructor updates status to Resolved and provides resolution notes (HTTP 200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/v1/grievances/${testGrievanceId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'Resolved',
          resolution_notes: 'Verified Quiz 2 physical attendance sheet and corrected score to 18/20.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolution_notes).toBe('Verified Quiz 2 physical attendance sheet and corrected score to 18/20.');
      expect(res.body.data.resolved_at).toBeDefined();
    });

    it('TC-10.6: Reject unassigned faculty member from resolving grievance (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/grievances/${testGrievanceId}`)
        .set('Authorization', `Bearer ${faculty2Token}`)
        .send({
          status: 'Resolved',
          resolution_notes: 'Unassigned faculty attempt.',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TC-10.7: Reject student role from updating or resolving grievance status (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/grievances/${testGrievanceId}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          status: 'Resolved',
          resolution_notes: 'Self-resolving grievance.',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TC-10.8: Reject invalid status value (HTTP 400 Bad Request)', async () => {
      const res = await request(app)
        .patch(`/api/v1/grievances/${testGrievanceId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'InvalidStatus',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Display Resolution Notes & IDOR Access Control (GET /api/v1/grievances/:id)', () => {
    let resolvedGrievanceId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          course_id: 1,
          grievance_type: 'grade',
          title: 'Final Grade Card Discrepancy',
          description: 'Lab component grade recorded as C instead of A.',
        });
      resolvedGrievanceId = createRes.body.data.grievance_id;

      await request(app)
        .patch(`/api/v1/grievances/${resolvedGrievanceId}`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'Resolved',
          resolution_notes: 'Marks recalculated from lab logbook. Grade updated from C to A in ERP.',
        });
    });

    it('TC-10.9: Student can view own grievance and see the instructor resolution notes (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/grievances/${resolvedGrievanceId}`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Resolved');
      expect(res.body.data.resolution_notes).toBe(
        'Marks recalculated from lab logbook. Grade updated from C to A in ERP.'
      );
    });

    it('TC-10.10: Zero-Trust IDOR check: Student 2 cannot inspect Student 1 grievance (HTTP 403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/grievances/${resolvedGrievanceId}`)
        .set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TC-10.11: Linked Parent can view linked child grievance and resolution notes (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/grievances/${resolvedGrievanceId}`)
        .set('Authorization', `Bearer ${parent1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resolution_notes).toBe(
        'Marks recalculated from lab logbook. Grade updated from C to A in ERP.'
      );
    });

    it('TC-10.12: Student retrieves their list of grievances via GET /api/v1/grievances', async () => {
      const res = await request(app)
        .get('/api/v1/grievances')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].student_id).toBe(1);
    });
  });
});
