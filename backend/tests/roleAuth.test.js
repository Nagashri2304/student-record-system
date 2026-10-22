/**
 * Unit Tests: Role-Based Access Control (RBAC) & Middleware Verification
 * Issue: #7 [SP-5] FR-01: Secure Authentication & Role-Based Access Control
 * Test Plan: TC-01, TC-06, TC-07
 * Author: Monika PM (@Monikapm19)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { JWT_SECRET } = require('../src/middleware/roleAuth');

describe('FR-01: Role-Based Access Control (RBAC) Middleware Tests', () => {
  // Helper to generate test JWT tokens for specific roles
  const generateToken = (role, options = {}) => {
    return jwt.sign(
      {
        user_id: 101,
        email: `${role.toLowerCase()}@edutrack.edu`,
        role,
      },
      JWT_SECRET,
      { expiresIn: options.expiresIn || '30m' }
    );
  };

  describe('1. Token Presence & Integrity Verification (HTTP 401)', () => {
    test('TC-06.1: Reject request without Authorization header with HTTP 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/admin-only');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No token provided/i);
    });

    test('TC-06.2: Reject malformed token not following Bearer schema with HTTP 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', 'Basic dXNlcjpwYXNz');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No token provided/i);
    });

    test('TC-06.3: Reject invalid or forged token signature with HTTP 401 Unauthorized', async () => {
      const forgedToken = jwt.sign(
        { user_id: 999, role: 'Admin' },
        'wrong_attacker_secret_key'
      );

      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid authentication token/i);
    });

    test('TC-06.4: Reject expired JWT token with HTTP 401 Unauthorized', async () => {
      // Create a token expired 5 seconds ago
      const expiredToken = jwt.sign(
        { user_id: 101, role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '-5s' }
      );

      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Token expired/i);
    });
  });

  describe('2. Role Permission Enforcement (HTTP 200 vs HTTP 403 Forbidden)', () => {
    test('TC-06.5: Allow Admin to access Admin-only route with HTTP 200 OK', async () => {
      const adminToken = generateToken('Admin');

      const res = await request(app)
        .get('/api/v1/auth/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Welcome Administrator/i);
      expect(res.body.user.role).toBe('Admin');
    });

    test('TC-06.6: Reject Faculty, Student, and Parent from Admin-only route with HTTP 403 Forbidden', async () => {
      const unauthorizedRoles = ['Faculty', 'Student', 'Parent'];

      for (const role of unauthorizedRoles) {
        const token = generateToken(role);

        const res = await request(app)
          .get('/api/v1/auth/admin-only')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Forbidden/i);
      }
    });

    test('TC-06.7: Allow Faculty to access Faculty-only route, reject Student with HTTP 403', async () => {
      const facultyToken = generateToken('Faculty');
      const studentToken = generateToken('Student');

      // Faculty access -> 200 OK
      const facultyRes = await request(app)
        .get('/api/v1/auth/faculty-only')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(facultyRes.status).toBe(200);

      // Student access -> 403 Forbidden
      const studentRes = await request(app)
        .get('/api/v1/auth/faculty-only')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentRes.status).toBe(403);
    });

    test('TC-06.8: Allow Student to access Student route, reject Parent with HTTP 403', async () => {
      const studentToken = generateToken('Student');
      const parentToken = generateToken('Parent');

      const studentRes = await request(app)
        .get('/api/v1/auth/student-only')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentRes.status).toBe(200);

      const parentRes = await request(app)
        .get('/api/v1/auth/student-only')
        .set('Authorization', `Bearer ${parentToken}`);
      expect(parentRes.status).toBe(403);
    });

    test('TC-06.9: Multi-role route allows both Admin and Faculty, but rejects Student', async () => {
      const adminToken = generateToken('Admin');
      const facultyToken = generateToken('Faculty');
      const studentToken = generateToken('Student');

      const adminRes = await request(app)
        .get('/api/v1/auth/staff-only')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);

      const facultyRes = await request(app)
        .get('/api/v1/auth/staff-only')
        .set('Authorization', `Bearer ${facultyToken}`);
      expect(facultyRes.status).toBe(200);

      const studentRes = await request(app)
        .get('/api/v1/auth/staff-only')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentRes.status).toBe(403);
    });
  });

  describe('3. Token Introspection /api/v1/auth/me', () => {
    test('TC-06.10: Return authenticated user token claims via GET /api/v1/auth/me', async () => {
      const studentToken = generateToken('Student');

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        email: 'student@edutrack.edu',
        role: 'Student',
      });
    });
  });
});
