/**
 * Unit Tests: Authentication, Password Hashing & Account Lockout
 * Issues:
 *   - #7  [SP-5] FR-01: Secure Authentication & Role-Based Access Control
 *   - #11 [SP-3] SEC-01: JWT Session Security, Password Hashing & Lockout
 * Test Plan: TC-01, TC-02, TC-07
 * Author: Monika PM (@Monikapm19)
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const { JWT_SECRET } = require('../src/middleware/roleAuth');

describe('SEC-01 & FR-01: Authentication & Password Security Tests', () => {
  beforeEach(async () => {
    // Reset seed users before each test to guarantee test isolation
    await userModel.seedMockUsers();
  });

  describe('1. Bcrypt Password Hashing & Cost Factor Verification', () => {
    test('TC-01.1: Passwords must be hashed using bcrypt with salt factor >= 10', async () => {
      const plaintext = 'SecurePass@2026';
      const hash = await userModel.hashPassword(plaintext);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      // Bcrypt hash format: $2a$10$... or $2b$10$...
      expect(hash).toMatch(/^\$2[aby]\$[0-9]{2}\$/);

      // Verify cost factor is at least 10
      const costFactor = parseInt(hash.split('$')[2], 10);
      expect(costFactor).toBeGreaterThanOrEqual(10);

      // Verify comparison logic
      const isMatch = await userModel.comparePassword(plaintext, hash);
      expect(isMatch).toBe(true);

      const isMismatch = await userModel.comparePassword('WrongPassword', hash);
      expect(isMismatch).toBe(false);
    });
  });

  describe('2. POST /api/v1/auth/login - Credential Verification & JWT Issuance', () => {
    test('TC-01.2: Valid credentials return HTTP 200 with signed JWT containing role claim', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@edutrack.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        email: 'admin@edutrack.edu',
        role: 'Admin',
      });

      // Verify JWT signature and claims
      const decoded = jwt.verify(res.body.token, JWT_SECRET);
      expect(decoded.email).toBe('admin@edutrack.edu');
      expect(decoded.role).toBe('Admin');
      expect(decoded.user_id).toBeDefined();

      // Verify 30-minute token expiration (1800 seconds)
      const tokenLifespanSeconds = decoded.exp - decoded.iat;
      expect(tokenLifespanSeconds).toBe(1800);
    });

    test('TC-01.3: Reject login with HTTP 400 when email or password is missing', async () => {
      const resWithoutPass = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@edutrack.edu' });
      expect(resWithoutPass.status).toBe(400);

      const resWithoutEmail = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'Password@123' });
      expect(resWithoutEmail.status).toBe(400);
    });

    test('TC-01.4: Reject non-existent user with HTTP 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown.user@edutrack.edu',
          password: 'Password@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    test('TC-01.5: Incorrect password returns HTTP 401 with remaining attempts warning', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@edutrack.edu',
          password: 'WrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.attemptsRemaining).toBe(4);
    });
  });

  describe('3. SEC-01: Account Lockout after 5 Consecutive Failed Attempts', () => {
    test('TC-02.1: Lock account for 15 minutes upon 5 failed attempts (HTTP 423 Locked)', async () => {
      const email = 'faculty@edutrack.edu';

      // 4 consecutive failed attempts (HTTP 401)
      for (let i = 1; i <= 4; i++) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email, password: 'BadPassword' });

        expect(res.status).toBe(401);
        expect(res.body.attemptsRemaining).toBe(5 - i);
      }

      // 5th failed attempt: must trigger account lockout (HTTP 423 Locked)
      const fifthAttempt = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'BadPassword' });

      expect(fifthAttempt.status).toBe(423);
      expect(fifthAttempt.body.success).toBe(false);
      expect(fifthAttempt.body.message).toMatch(/locked/i);
      expect(fifthAttempt.body.lockedUntil).toBeDefined();

      // Subsequent attempt even with VALID password must still be rejected with 423 Locked
      const lockedLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password@123' });

      expect(lockedLogin.status).toBe(423);
      expect(lockedLogin.body.message).toMatch(/locked/i);
    });

    test('TC-02.2: Reset lockout counter when lock window expires', async () => {
      const email = 'student@edutrack.edu';

      // Manually simulate expired lock window
      const expiredTime = new Date(Date.now() - 1000); // 1 second in the past
      await userModel.updateLockout(email, 5, expiredTime);

      // Successful login should now unlock account and succeed with 200 OK
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      // Verify database/store record has been cleared
      const user = await userModel.findByEmail(email);
      expect(user.failed_attempts).toBe(0);
      expect(user.locked_until).toBeNull();
    });

    test('TC-02.3: Reset failed attempts upon successful login before reaching 5', async () => {
      const email = 'parent@edutrack.edu';

      // 2 failed attempts
      await request(app).post('/api/v1/auth/login').send({ email, password: 'Wrong' });
      await request(app).post('/api/v1/auth/login').send({ email, password: 'Wrong' });

      // Successful login
      const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password@123' });
      expect(res.status).toBe(200);

      const user = await userModel.findByEmail(email);
      expect(user.failed_attempts).toBe(0);
    });
  });
});
