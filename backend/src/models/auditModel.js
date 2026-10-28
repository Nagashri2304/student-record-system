/**
 * Security Audit Logging Data Access Model
 * Requirement: SRS FR-13, SEC-03, SEC-04; Test Plan TC-09
 * Issue: #18 [SP-3] SEC-03: Immutable Security Audit Logging for Data Alterations
 * Author: Monika PM (@Monikapm19)
 */
const db = require('../config/db');

// In-memory store for isolated unit testing and standalone execution
const inMemoryAuditLogs = [];
let nextAuditId = 1;

/**
 * Seed initial audit records for testing
 */
const seedMockAuditLogs = () => {
  inMemoryAuditLogs.length = 0;
  nextAuditId = 1;

  const sampleLogs = [
    {
      audit_id: nextAuditId++,
      actor_user_id: 1, // Admin
      action: 'USER_LOGIN_SUCCESS',
      entity_type: 'user',
      entity_id: 1,
      old_value: null,
      new_value: { status: 'authenticated' },
      note: 'Admin session authenticated via JWT',
      ip_address: '127.0.0.1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      audit_id: nextAuditId++,
      actor_user_id: 2, // Faculty
      action: 'GRADE_SUBMITTED',
      entity_type: 'grade',
      entity_id: 101,
      old_value: null,
      new_value: { marks: 88, letter_grade: 'A' },
      note: 'Initial semester grade submission',
      ip_address: '192.168.1.45',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      audit_id: nextAuditId++,
      actor_user_id: 1, // Admin
      action: 'STUDENT_ENROLLED',
      entity_type: 'student',
      entity_id: 1,
      old_value: null,
      new_value: { roll_number: '2026CSE001', dept: 'CSE' },
      note: 'Student profile created and enrolled',
      ip_address: '127.0.0.1',
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
  ];

  for (const log of sampleLogs) {
    inMemoryAuditLogs.push(log);
  }
};

// Seed initial records
seedMockAuditLogs();

/**
 * Create a new immutable audit log entry
 * Enforces non-repudiation: captures Actor, Action, Entity, Old Value, New Value, Timestamp
 */
const createAuditLog = async ({
  actor_user_id,
  action,
  entity_type = 'general',
  entity_id = null,
  old_value = null,
  new_value = null,
  note = null,
  ip_address = '127.0.0.1',
}) => {
  const timestamp = new Date().toISOString();

  if (db.pool) {
    const res = await db.query(
      `INSERT INTO audit_logs (
        actor_user_id, action, entity_type, entity_id,
        old_value, new_value, note, ip_address, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        actor_user_id,
        action,
        entity_type,
        entity_id,
        old_value ? JSON.stringify(old_value) : null,
        new_value ? JSON.stringify(new_value) : null,
        note,
        ip_address,
      ]
    );
    return res.rows[0];
  }

  const entry = {
    audit_id: nextAuditId++,
    actor_user_id: actor_user_id ? Number(actor_user_id) : null,
    action,
    entity_type,
    entity_id: entity_id ? Number(entity_id) : null,
    old_value,
    new_value,
    note,
    ip_address,
    timestamp,
  };

  inMemoryAuditLogs.push(entry);
  return { ...entry };
};

/**
 * Retrieve audit logs with optional filtering and pagination
 * Restricted exclusively to Administrators
 */
const getAuditLogs = async ({
  action,
  entity_type,
  actor_user_id,
  limit = 50,
  offset = 0,
} = {}) => {
  if (db.pool) {
    const conditions = [];
    const params = [];

    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }
    if (entity_type) {
      params.push(entity_type);
      conditions.push(`entity_type = $${params.length}`);
    }
    if (actor_user_id) {
      params.push(actor_user_id);
      conditions.push(`actor_user_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Number(limit) || 50);
    const limitParam = `$${params.length}`;
    params.push(Number(offset) || 0);
    const offsetParam = `$${params.length}`;

    const res = await db.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params
    );

    const countRes = await db.query(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`, params.slice(0, conditions.length));
    return {
      total: parseInt(countRes.rows[0].total, 10),
      logs: res.rows,
    };
  }

  let logs = [...inMemoryAuditLogs];

  if (action) {
    logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
  }
  if (entity_type) {
    logs = logs.filter((l) => l.entity_type.toLowerCase() === entity_type.toLowerCase());
  }
  if (actor_user_id) {
    logs = logs.filter((l) => l.actor_user_id === Number(actor_user_id));
  }

  // Sort descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;
  const paginatedLogs = logs.slice(Number(offset), Number(offset) + Number(limit));

  return {
    total,
    logs: paginatedLogs,
  };
};

/**
 * Enforce database & application-level immutability.
 * Attempting to update or delete audit logs must throw a security error.
 */
const updateAuditLog = async () => {
  throw new Error('Security Policy Violation: audit_logs is append-only and immutable. UPDATE statements are revoked.');
};

const deleteAuditLog = async () => {
  throw new Error('Security Policy Violation: audit_logs is append-only and immutable. DELETE statements are revoked.');
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  updateAuditLog,
  deleteAuditLog,
  seedMockAuditLogs,
  inMemoryAuditLogs,
};
