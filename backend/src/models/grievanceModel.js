/**
 * Grievance Data Access Model & State Machine
 * Requirement: SRS FR-10, FR-15; Architecture SAD Component C9 (Grievance Service)
 * Issue: #16 [SP-3] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow
 * Author: Kushitha K (@Kushitha30)
 */
const db = require('../config/db');

// In-memory grievance store for standalone execution, mock environments, and fast unit tests
const inMemoryGrievances = new Map();
let nextGrievanceId = 1;

/**
 * Valid grievance statuses and types
 */
const GRIEVANCE_STATUSES = ['Open', 'In Review', 'Resolved'];
const GRIEVANCE_TYPES = ['grade', 'attendance'];

/**
 * Seed initial mock grievances into in-memory store
 */
const seedMockGrievances = () => {
  inMemoryGrievances.clear();
  nextGrievanceId = 1;

  const initialGrievances = [
    {
      grievance_id: 1,
      student_id: 1, // Aarav Sharma
      course_id: 1, // CS101 (Assigned to faculty user_id: 2)
      grievance_type: 'grade',
      title: 'Discrepancy in CS101 ISA Test Marks',
      description: 'My score for ISA test 1 was computed as 14 instead of 18.',
      status: 'Open',
      resolution_notes: null,
      resolved_by: null,
      created_at: new Date('2026-10-25T10:00:00Z').toISOString(),
      updated_at: new Date('2026-10-25T10:00:00Z').toISOString(),
      resolved_at: null,
    },
  ];

  for (const g of initialGrievances) {
    inMemoryGrievances.set(g.grievance_id, { ...g });
    if (g.grievance_id >= nextGrievanceId) {
      nextGrievanceId = g.grievance_id + 1;
    }
  }
};

/**
 * Create a new academic or attendance grievance
 * Creates ticket in 'Open' state
 */
const createGrievance = async ({
  student_id,
  course_id,
  grievance_type = 'grade',
  title,
  description,
}) => {
  if (db.query) {
    try {
      const sql = `
        INSERT INTO grievances (student_id, course_id, grievance_type, title, description, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const result = await db.query(sql, [student_id, course_id, grievance_type, title, description]);
      return result.rows[0];
    } catch (err) {
      // Fallback to in-memory store if DB query fails or unconfigured
    }
  }

  const grievanceId = nextGrievanceId++;
  const newGrievance = {
    grievance_id: grievanceId,
    student_id: Number(student_id),
    course_id: Number(course_id),
    grievance_type,
    title,
    description,
    status: 'Open',
    resolution_notes: null,
    resolved_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    resolved_at: null,
  };

  inMemoryGrievances.set(grievanceId, newGrievance);
  return { ...newGrievance };
};

/**
 * Find grievance by ID
 */
const findById = async (grievanceId) => {
  const id = Number(grievanceId);

  if (db.query) {
    try {
      const result = await db.query('SELECT * FROM grievances WHERE grievance_id = $1', [id]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (err) {
      // Fallback to in-memory
    }
  }

  const record = inMemoryGrievances.get(id);
  return record ? { ...record } : null;
};

/**
 * Update grievance status and resolution notes
 * Typically called by assigned instructor or admin
 */
const updateGrievanceStatus = async (grievanceId, { status, resolution_notes, resolved_by }) => {
  const id = Number(grievanceId);

  if (db.query) {
    try {
      const resolvedAt = status === 'Resolved' ? 'CURRENT_TIMESTAMP' : 'NULL';
      const sql = `
        UPDATE grievances
        SET status = $1,
            resolution_notes = COALESCE($2, resolution_notes),
            resolved_by = COALESCE($3, resolved_by),
            resolved_at = ${status === 'Resolved' ? 'CURRENT_TIMESTAMP' : 'resolved_at'},
            updated_at = CURRENT_TIMESTAMP
        WHERE grievance_id = $4
        RETURNING *
      `;
      const result = await db.query(sql, [status, resolution_notes, resolved_by, id]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (err) {
      // Fallback to in-memory
    }
  }

  const existing = inMemoryGrievances.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    status: status || existing.status,
    resolution_notes: resolution_notes !== undefined ? resolution_notes : existing.resolution_notes,
    resolved_by: resolved_by !== undefined ? resolved_by : existing.resolved_by,
    updated_at: new Date().toISOString(),
    resolved_at: status === 'Resolved' ? new Date().toISOString() : existing.resolved_at,
  };

  inMemoryGrievances.set(id, updated);
  return { ...updated };
};

/**
 * Get grievances for a specific student (Student self-service)
 */
const findByStudentId = async (studentId) => {
  const sId = Number(studentId);

  if (db.query) {
    try {
      const result = await db.query(
        'SELECT * FROM grievances WHERE student_id = $1 ORDER BY created_at DESC',
        [sId]
      );
      if (result.rows.length > 0) return result.rows;
    } catch (err) {
      // Fallback
    }
  }

  return Array.from(inMemoryGrievances.values())
    .filter((g) => Number(g.student_id) === sId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

/**
 * Get grievances by course ID
 */
const findByCourseId = async (courseId) => {
  const cId = Number(courseId);

  if (db.query) {
    try {
      const result = await db.query(
        'SELECT * FROM grievances WHERE course_id = $1 ORDER BY created_at DESC',
        [cId]
      );
      if (result.rows.length > 0) return result.rows;
    } catch (err) {
      // Fallback
    }
  }

  return Array.from(inMemoryGrievances.values())
    .filter((g) => Number(g.course_id) === cId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

/**
 * List all grievances (Admin view)
 */
const findAll = async () => {
  if (db.query) {
    try {
      const result = await db.query('SELECT * FROM grievances ORDER BY created_at DESC');
      if (result.rows.length > 0) return result.rows;
    } catch (err) {
      // Fallback
    }
  }

  return Array.from(inMemoryGrievances.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

module.exports = {
  GRIEVANCE_STATUSES,
  GRIEVANCE_TYPES,
  seedMockGrievances,
  createGrievance,
  findById,
  updateGrievanceStatus,
  findByStudentId,
  findByCourseId,
  findAll,
};
