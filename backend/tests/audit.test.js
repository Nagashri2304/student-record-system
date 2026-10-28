/**
 * Immutable Security Audit Logging Test Suite
 * Requirement: SRS FR-13, SEC-03, SEC-04; Test Plan TC-09
 * Issue: #18 [SP-3] SEC-03: Immutable Security Audit Logging for Data Alterations
 * Author: Monika PM (@Monikapm19)
 */
const request = require('supertest');
const app = require('../src/app');
const userModel = require('../src/models/userModel');
const auditModel = require('../src/models/auditModel');

let adminToken;
let facultyToken;
let studentToken;
let parentToken;

beforeAll(async () => {
  await userModel.seedMockUsers();
  auditModel.seedMockAuditLogs();

  // Login tokens
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

  const studentRes = await request(app).post('/api/v1/auth/login').send({
    email: 'student@edutrack.edu',
    password: 'Password@123',
  });
  studentToken = studentRes.body.token;

  const parentRes = await request(app).post('/api/v1/auth/login').send({
    email: 'parent@edutrack.edu',
    password: 'Password@123',
  });
  parentToken = parentRes.body.token;
});

describe('SEC-03: Immutable Security Audit Logging Tests (TC-09)', () => {
  describe('1. Role Authorization on Audit Logs (GET /api/v1/audit-logs)', () => {
    it('TC-09.1: Administrator successfully retrieves audit trail (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('TC-09.2: /api/v1/audit/logs alias endpoint returns audit trail for Admin (HTTP 200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('TC-09.3: Reject Faculty, Student, and Parent from viewing audit logs (HTTP 403 Forbidden)', async () => {
      const unauthorizedTokens = [facultyToken, studentToken, parentToken];

      for (const token of unauthorizedTokens) {
        const res = await request(app)
          .get('/api/v1/audit-logs')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
      }
    });

    it('TC-09.4: Reject unauthenticated requests to audit logs (HTTP 401 Unauthorized)', async () => {
      const res = await request(app).get('/api/v1/audit-logs');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Audit Record Structure & Accountability Verification', () => {
    it('TC-09.5: Audit records record User ID, Action, Entity, Timestamp, Old Value, and New Value', async () => {
      // Create a test mutation audit log
      const newAudit = await auditModel.createAuditLog({
        actor_user_id: 1,
        action: 'GRADE_AMENDED',
        entity_type: 'grade',
        entity_id: 105,
        old_value: { marks: 75, grade: 'B' },
        new_value: { marks: 85, grade: 'A' },
        note: 'Recalculated from assignment re-evaluation',
        ip_address: '10.0.0.5',
      });

      expect(newAudit).toBeDefined();
      expect(newAudit.actor_user_id).toBe(1);
      expect(newAudit.action).toBe('GRADE_AMENDED');
      expect(newAudit.entity_type).toBe('grade');
      expect(newAudit.entity_id).toBe(105);
      expect(newAudit.old_value).toEqual({ marks: 75, grade: 'B' });
      expect(newAudit.new_value).toEqual({ marks: 85, grade: 'A' });
      expect(newAudit.timestamp).toBeDefined();

      // Retrieve via API to verify persistence
      const res = await request(app)
        .get('/api/v1/audit-logs?action=GRADE_AMENDED')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const record = res.body.data.find((l) => l.action === 'GRADE_AMENDED');
      expect(record).toBeDefined();
      expect(record.actor_user_id).toBe(1);
      expect(record.entity_type).toBe('grade');
    });

    it('TC-09.6: Filter audit logs by action and pagination', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?action=USER_LOGIN_SUCCESS&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const log of res.body.data) {
        expect(log.action).toBe('USER_LOGIN_SUCCESS');
      }
    });
  });

  describe('3. Immutability Enforcement (Revocation of UPDATE and DELETE)', () => {
    it('TC-09.7: Reject attempt to update an audit log entry (HTTP 405 Method Not Allowed)', async () => {
      const res = await request(app)
        .put('/api/v1/audit-logs/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'TAMPERED_ACTION' });

      expect(res.status).toBe(405);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/immutable|prohibited/i);
    });

    it('TC-09.8: Reject attempt to delete an audit log entry (HTTP 405 Method Not Allowed)', async () => {
      const res = await request(app)
        .delete('/api/v1/audit-logs/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(405);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/immutable|prohibited/i);
    });

    it('TC-09.9: Internal model throws security exception if update or delete is called', async () => {
      await expect(auditModel.updateAuditLog()).rejects.toThrow(/immutable/i);
      await expect(auditModel.deleteAuditLog()).rejects.toThrow(/immutable/i);
    });
  });
});
