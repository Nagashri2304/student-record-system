/**
 * Input Sanitization, Parameterized Queries & XSS/SQLi Defense Test Suite
 * Requirement: SRS SEC-04; Test Plan TC-08
 * Issue: #17 [SP-3] SEC-02: Input Sanitization, Parameterized Queries & XSS/SQLi Defense
 * Author: Monika PM (@Monikapm19)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const studentModel = require('../src/models/studentModel');
const courseModel = require('../src/models/courseModel');
const { sanitizeValue, deepSanitize } = require('../src/middleware/sanitizeInput');

let adminToken;
let studentToken;

beforeAll(async () => {
  await userModel.seedMockUsers();
  studentModel.seedMockStudents();
  courseModel.seedMockCourses();

  // Admin token
  const adminRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@edutrack.edu',
    password: 'Password@123',
  });
  adminToken = adminRes.body.token;

  // Student token
  const studentRes = await request(app).post('/api/v1/auth/login').send({
    email: 'student@edutrack.edu',
    password: 'Password@123',
  });
  studentToken = studentRes.body.token;
});

describe('SEC-02: SQL Injection & Cross-Site Scripting (XSS) Defense Tests (TC-08)', () => {
  describe('1. SQL Injection Defense & Parameterized Queries (TC-08.1 - TC-08.4)', () => {
    it('TC-08.1: SQL injection in login email is evaluated literally and rejected with HTTP 401', async () => {
      const sqlPayloads = [
        "' OR '1'='1",
        "admin@edutrack.edu' --",
        "' OR 1=1; --",
        "admin@edutrack.edu' /*",
        "' UNION SELECT NULL, NULL, NULL --",
      ];

      for (const payload of sqlPayloads) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: payload, password: 'Password@123' });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.token).toBeUndefined();
      }
    });

    it('TC-08.2: SQL injection in password field is safely hashed/compared without raw query execution', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@edutrack.edu',
          password: "' OR '1'='1",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.token).toBeUndefined();
    });

    it('TC-08.3: SQL injection in student name / roll number treated as literal data, preventing table drops', async () => {
      const dropPayload = "MaliciousStudent'; DROP TABLE students; --";

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roll_number: '2026SQLI01',
          first_name: dropPayload,
          last_name: 'Test',
          email: 'sqli.student@edutrack.edu',
          dob: '2004-01-01',
          dept_id: 1,
          semester: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.first_name).toContain('MaliciousStudent');

      // Verify students table remains intact and student was stored safely
      const verifyRes = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.length).toBeGreaterThan(0);
    });

    it('TC-08.4: SQL injection payload in query params is parameterized safely without database errors', async () => {
      const res = await request(app)
        .get('/api/v1/students?search=\' OR 1=1; --')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. Cross-Site Scripting (XSS) Sanitization Defense (TC-08.5 - TC-08.8)', () => {
    it('TC-08.5: Stored XSS script tags in grievance submission are neutralized', async () => {
      const xssTitle = "<script>alert('XSS-TITLE')</script>Grade Issue";
      const xssDesc = "Review needed <script src='http://attacker.com/evil.js'></script> immediately.";

      const res = await request(app)
        .post('/api/v1/grievances')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          course_id: 1,
          grievance_type: 'grade',
          title: xssTitle,
          description: xssDesc,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify the script tag has been stripped or escaped
      expect(res.body.data.title).not.toContain('<script>');
      expect(res.body.data.title).not.toContain('</script>');
      expect(res.body.data.description).not.toContain('<script');
    });

    it('TC-08.6: Stored XSS inline event handlers and javascript: URI are neutralized', async () => {
      const eventHandlerPayload = "<img src='invalid.png' onerror='alert(\"XSS\")' onload='stealCookie()'>";
      const jsProtocolPayload = "<a href='javascript:alert(1)'>Click me</a>";

      const sanitizedImg = sanitizeValue(eventHandlerPayload);
      expect(sanitizedImg).not.toContain('onerror=');
      expect(sanitizedImg).not.toContain('onload=');

      const sanitizedLink = sanitizeValue(jsProtocolPayload);
      expect(sanitizedLink).not.toContain('javascript:');
    });

    it('TC-08.7: Deep nested input sanitization cleans complex objects and arrays', async () => {
      const complexPayload = {
        outer: "<script>alert('outer')</script>safe",
        nested: {
          inner: "<iframe src='malicious.com'></iframe>content",
          list: ["<b onmouseover='alert(1)'>bold</b>", "clean text"],
        },
      };

      const sanitized = deepSanitize(complexPayload);
      expect(sanitized.outer).not.toContain('<script>');
      expect(sanitized.nested.inner).not.toContain('<iframe');
      expect(sanitized.nested.list[0]).not.toContain('onmouseover=');
      expect(sanitized.nested.list[1]).toBe('clean text');
    });

    it('TC-08.8: Grade amendment note with HTML injection is sanitized prior to storage', async () => {
      const dirtyNote = "Corrected calculation <script>sendTokens()</script> verified by teacher.";

      const sanitizedNote = sanitizeValue(dirtyNote);
      expect(sanitizedNote).not.toContain('<script>');
      expect(sanitizedNote).toContain('Corrected calculation');
      expect(sanitizedNote).toContain('verified by teacher.');
    });
  });
});
