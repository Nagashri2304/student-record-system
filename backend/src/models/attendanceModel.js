/**
 * Daily Attendance & Session Validation Data Access Model
 * Requirement: SRS FR-04 (Daily Attendance Marking & Session Validation Engine)
 * Test Plan: TC-04
 * Issue: #1 [SP-5] FR-04: Daily Attendance Marking & Session Validation Engine
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const db = require('../config/db');

// In-memory attendance stores for standalone execution, mock environments, and fast unit tests
const inMemorySessions = new Map();
const inMemoryRecords = new Map();

let nextSessionId = 1;
let nextRecordId = 1;

const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parsePositiveInteger = (value, fieldName) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw validationError(`Invalid ${fieldName} provided.`);
  }
  return parsed;
};

const validateSessionDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return new Date().toISOString().slice(0, 10);
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw validationError('Invalid session_date. Expected a valid date in YYYY-MM-DD format.');
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
    throw validationError('Invalid session_date. Expected a valid date in YYYY-MM-DD format.');
  }
  return value;
};

/**
 * Seed initial mock attendance sessions and records
 */
const seedMockAttendance = () => {
  inMemorySessions.clear();
  inMemoryRecords.clear();
  nextSessionId = 1;
  nextRecordId = 1;

  // Mock Session 1 for Course 1 (Data Structures)
  const session1 = {
    session_id: 1,
    course_id: 1,
    faculty_user_id: 2, // Faculty user
    session_date: new Date().toISOString().split('T')[0],
    period: 1,
    topic: 'Introduction to Linked Lists',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemorySessions.set(1, session1);
  nextSessionId = 2;

  // Records for Session 1
  const rec1 = {
    record_id: 1,
    session_id: 1,
    student_id: 1,
    status: 'present',
    remarks: 'Attended full session',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const rec2 = {
    record_id: 2,
    session_id: 1,
    student_id: 2,
    status: 'absent',
    remarks: 'Unexcused absence',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryRecords.set(1, rec1);
  inMemoryRecords.set(2, rec2);
  nextRecordId = 3;
};

// Initialize mock store
seedMockAttendance();

/**
 * Create a new batch attendance session
 */
const createSession = async ({
  course_id,
  faculty_user_id,
  session_date,
  period = 1,
  topic = 'Lecture Session',
  records = [],
}) => {
  const numericCourseId = parsePositiveInteger(course_id, 'course_id');
  const numericFacultyId = parsePositiveInteger(faculty_user_id, 'faculty_user_id');
  const normalizedDate = validateSessionDate(session_date);
  const numericPeriod = period === undefined || period === null
    ? 1
    : parsePositiveInteger(period, 'period');
  const now = new Date().toISOString();

  // Validate records array
  if (!Array.isArray(records) || records.length === 0) {
    throw validationError('Attendance session must include at least one student attendance record.');
  }

  // Validate and sanitize records
  const validatedRecords = [];
  const seenStudentIds = new Set();

  for (const item of records) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw validationError('Each attendance record must be an object.');
    }
    const studentId = parsePositiveInteger(item.student_id, 'student_id');
    if (seenStudentIds.has(studentId)) {
      throw validationError(`Duplicate attendance record for student_id ${studentId} in the same session.`);
    }
    seenStudentIds.add(studentId);

    const normalizedStatus = typeof item.status === 'string' ? item.status.toLowerCase().trim() : '';
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throw validationError(`Invalid attendance status '${item.status}'. Allowed values: ${VALID_STATUSES.join(', ')}.`);
    }

    validatedRecords.push({
      student_id: studentId,
      status: normalizedStatus,
      remarks: item.remarks ? String(item.remarks).trim() : null,
    });
  }

  // Persist the entire session as one unit; never report success after a partial database write.
  if (db.pool) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const sessionResult = await client.query(
        `INSERT INTO attendance_sessions (course_id, faculty_user_id, session_date, period, topic, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING *`,
        [numericCourseId, numericFacultyId, normalizedDate, numericPeriod, topic || 'Lecture Session', now]
      );
      const session = sessionResult.rows[0];

      const createdRecords = [];
      for (const rec of validatedRecords) {
        const recResult = await client.query(
          `INSERT INTO attendance_records (session_id, student_id, status, remarks, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $5)
           RETURNING *`,
          [session.session_id, rec.student_id, rec.status, rec.remarks, now]
        );
        createdRecords.push(recResult.rows[0]);
      }

      await client.query('COMMIT');
      return {
        ...session,
        records: createdRecords,
        summary: calculateSummary(createdRecords),
      };
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        // Preserve the original database error.
      }
      if (err.code === '23503') {
        throw validationError('Course, faculty, or student record does not exist.');
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // In-memory store
  const sessionId = nextSessionId++;
  const session = {
    session_id: sessionId,
    course_id: numericCourseId,
    faculty_user_id: numericFacultyId,
    session_date: normalizedDate,
    period: numericPeriod,
    topic: topic || 'Lecture Session',
    created_at: now,
    updated_at: now,
  };
  inMemorySessions.set(sessionId, session);

  const createdRecords = [];
  for (const rec of validatedRecords) {
    const recordId = nextRecordId++;
    const recordObj = {
      record_id: recordId,
      session_id: sessionId,
      student_id: rec.student_id,
      status: rec.status,
      remarks: rec.remarks,
      created_at: now,
      updated_at: now,
    };
    inMemoryRecords.set(recordId, recordObj);
    createdRecords.push(recordObj);
  }

  return {
    ...session,
    records: createdRecords,
    summary: calculateSummary(createdRecords),
  };
};

/**
 * Helper to calculate session statistics
 */
const calculateSummary = (records) => {
  const total = records.length;
  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;

  for (const rec of records) {
    if (rec.status === 'present') present++;
    else if (rec.status === 'absent') absent++;
    else if (rec.status === 'late') late++;
    else if (rec.status === 'excused') excused++;
  }

  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  return { total, present, absent, late, excused, attendanceRate };
};

/**
 * Retrieve session by session_id with all records
 */
const findSessionById = async (sessionId) => {
  const numericId = parseInt(sessionId, 10);

  if (db.pool) {
    try {
      const res = await db.query('SELECT * FROM attendance_sessions WHERE session_id = $1', [numericId]);
      if (res.rows.length > 0) {
        const session = res.rows[0];
        const recsRes = await db.query('SELECT * FROM attendance_records WHERE session_id = $1', [numericId]);
        return {
          ...session,
          records: recsRes.rows,
          summary: calculateSummary(recsRes.rows),
        };
      }
    } catch (err) {}
  }

  const session = inMemorySessions.get(numericId);
  if (!session) return null;

  const records = [];
  for (const rec of inMemoryRecords.values()) {
    if (rec.session_id === numericId) {
      records.push(rec);
    }
  }

  return {
    ...session,
    records,
    summary: calculateSummary(records),
  };
};

/**
 * Retrieve all sessions for a given course
 */
const findSessionsByCourse = async (courseId) => {
  const numericCourseId = parseInt(courseId, 10);

  if (db.pool) {
    try {
      const res = await db.query(
        'SELECT * FROM attendance_sessions WHERE course_id = $1 ORDER BY session_date DESC, period DESC',
        [numericCourseId]
      );
      const sessions = [];
      for (const sess of res.rows) {
        const recs = await db.query('SELECT * FROM attendance_records WHERE session_id = $1', [sess.session_id]);
        sessions.push({
          ...sess,
          records: recs.rows,
          summary: calculateSummary(recs.rows),
        });
      }
      return sessions;
    } catch (err) {}
  }

  const sessions = [];
  for (const sess of inMemorySessions.values()) {
    if (sess.course_id === numericCourseId) {
      const records = [];
      for (const rec of inMemoryRecords.values()) {
        if (rec.session_id === sess.session_id) {
          records.push(rec);
        }
      }
      sessions.push({
        ...sess,
        records,
        summary: calculateSummary(records),
      });
    }
  }

  return sessions.sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
};

/**
 * Update an existing attendance session records
 * Enforces 24-hour edit limit on session records!
 */
const updateSession = async (sessionId, updates = {}, requestingUserId = null, requestingRole = 'Faculty') => {
  const session = await findSessionById(sessionId);
  if (!session) {
    throw new Error('Attendance session not found.');
  }

  // 24-Hour Edit Window Enforcement (SRS FR-04, Issue #1)
  const sessionCreatedAt = new Date(session.created_at).getTime();
  const nowTime = Date.now();
  const timeDifferenceMs = nowTime - sessionCreatedAt;

  if (timeDifferenceMs > TWENTY_FOUR_HOURS_MS) {
    const error = new Error('Attendance session records cannot be modified after 24 hours from creation.');
    error.statusCode = 403;
    error.code = 'EDIT_WINDOW_EXPIRED';
    throw error;
  }

  const now = new Date().toISOString();

  // If new records are provided in updates
  if (Array.isArray(updates.records) && updates.records.length > 0) {
    for (const item of updates.records) {
      const studentId = parseInt(item.student_id, 10);
      const normalizedStatus = (item.status || '').toLowerCase().trim();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        throw validationError(`Invalid attendance status '${item.status}'. Allowed values: ${VALID_STATUSES.join(', ')}.`);
      }

      // Update in memory records
      let existingRecord = null;
      for (const rec of inMemoryRecords.values()) {
        if (rec.session_id === session.session_id && rec.student_id === studentId) {
          existingRecord = rec;
          break;
        }
      }

      if (existingRecord) {
        existingRecord.status = normalizedStatus;
        if (item.remarks !== undefined) existingRecord.remarks = item.remarks;
        existingRecord.updated_at = now;
      } else {
        const recordId = nextRecordId++;
        inMemoryRecords.set(recordId, {
          record_id: recordId,
          session_id: session.session_id,
          student_id: studentId,
          status: normalizedStatus,
          remarks: item.remarks || null,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }

  // Update session topic/period if provided
  if (updates.topic) session.topic = updates.topic;
  if (updates.period) session.period = parseInt(updates.period, 10);
  session.updated_at = now;
  inMemorySessions.set(session.session_id, session);

  return await findSessionById(session.session_id);
};

/**
 * Get aggregated attendance stats for a specific student across all courses
 */
const getStudentAttendanceSummary = async (studentId) => {
  const numericStudentId = parseInt(studentId, 10);

  const courseBreakdown = new Map();
  let totalOverallSessions = 0;
  let totalOverallAttended = 0;

  for (const rec of inMemoryRecords.values()) {
    if (rec.student_id === numericStudentId) {
      const session = inMemorySessions.get(rec.session_id);
      if (!session) continue;

      const courseId = session.course_id;
      if (!courseBreakdown.has(courseId)) {
        courseBreakdown.set(courseId, {
          course_id: courseId,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        });
      }

      const item = courseBreakdown.get(courseId);
      item.total += 1;
      totalOverallSessions += 1;

      if (rec.status === 'present') {
        item.present += 1;
        totalOverallAttended += 1;
      } else if (rec.status === 'late') {
        item.late += 1;
        totalOverallAttended += 1;
      } else if (rec.status === 'absent') {
        item.absent += 1;
      } else if (rec.status === 'excused') {
        item.excused += 1;
      }
    }
  }

  const breakdown = [];
  for (const [courseId, stats] of courseBreakdown.entries()) {
    const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;
    breakdown.push({
      ...stats,
      attendancePercentage: rate,
      isShortage: rate < 75,
    });
  }

  const overallRate = totalOverallSessions > 0
    ? Math.round((totalOverallAttended / totalOverallSessions) * 100)
    : 0;

  return {
    student_id: numericStudentId,
    totalSessions: totalOverallSessions,
    totalAttended: totalOverallAttended,
    overallPercentage: overallRate,
    isShortage: overallRate < 75,
    courses: breakdown,
  };
};

// In-memory alert dispatch history
const inMemoryAlertDispatches = [];
const SHORTAGE_THRESHOLD = 75.0;

/**
 * FR-07: Real-Time Attendance Percentage Engine & Low Attendance Alert (<75%) System
 * Identifies all students across course batches falling below the statutory 75.0% boundary.
 */
const getAttendanceAlerts = async ({ course_id, threshold = 75.0 } = {}) => {
  const numericThreshold = Number(threshold) || 75.0;
  const numericCourseId = course_id ? parseInt(course_id, 10) : null;
  const alerts = [];

  const studentModel = require('./studentModel');
  const courseModel = require('./courseModel');

  // Group attendance records by (student_id, course_id)
  const studentCourseStats = new Map();

  for (const rec of inMemoryRecords.values()) {
    const session = inMemorySessions.get(rec.session_id);
    if (!session) continue;
    if (numericCourseId && session.course_id !== numericCourseId) continue;

    const key = `${rec.student_id}_${session.course_id}`;
    if (!studentCourseStats.has(key)) {
      studentCourseStats.set(key, {
        student_id: rec.student_id,
        course_id: session.course_id,
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
      });
    }

    const s = studentCourseStats.get(key);
    s.total += 1;
    if (rec.status === 'present') s.present += 1;
    else if (rec.status === 'late') s.late += 1;
    else if (rec.status === 'absent') s.absent += 1;
    else if (rec.status === 'excused') s.excused += 1;
  }

  for (const stats of studentCourseStats.values()) {
    if (stats.total === 0) continue;
    const rate = Number((((stats.present + stats.late) / stats.total) * 100).toFixed(1));

    if (rate < numericThreshold) {
      const student = await studentModel.findById(stats.student_id);
      const course = await courseModel.findById(stats.course_id);

      // Deficit: how many more consecutive classes needed to reach 75%
      const deficit = Math.max(1, Math.ceil((0.75 * stats.total - (stats.present + stats.late)) / 0.25));

      alerts.push({
        student_id: stats.student_id,
        student_name: student ? `${student.first_name} ${student.last_name}` : `Student ${stats.student_id}`,
        roll_number: student ? student.roll_number : null,
        course_id: stats.course_id,
        course_code: course ? course.course_code : `COURSE-${stats.course_id}`,
        course_name: course ? course.course_name : 'Unknown Course',
        total_sessions: stats.total,
        attended_sessions: stats.present + stats.late,
        absent_sessions: stats.absent,
        excused_sessions: stats.excused,
        attendance_percentage: rate,
        is_shortage: true,
        threshold: numericThreshold,
        debarment_risk: rate < 65.0 ? 'CRITICAL' : 'HIGH',
        warning_level: 'ATTENDANCE_SHORTAGE_WARNING',
        warning_banner: `Warning: Attendance is ${rate}% (below ${numericThreshold}%). Risk of semester exam debarment.`,
        classes_needed_to_reach_75: deficit,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts.sort((a, b) => a.attendance_percentage - b.attendance_percentage);
};

/**
 * Dispatch automated low attendance warning notifications (SMS / Email mock)
 */
const dispatchAttendanceAlerts = async ({ course_id, threshold = 75.0, actor_user_id = null }) => {
  const alerts = await getAttendanceAlerts({ course_id, threshold });
  const dispatchTimestamp = new Date().toISOString();

  const dispatched = [];
  for (const alert of alerts) {
    const dispatchRecord = {
      dispatch_id: inMemoryAlertDispatches.length + 1,
      student_id: alert.student_id,
      student_name: alert.student_name,
      course_id: alert.course_id,
      course_code: alert.course_code,
      attendance_percentage: alert.attendance_percentage,
      debarment_risk: alert.debarment_risk,
      channel: 'SMS_AND_EMAIL',
      message: `URGENT ACADEMIC NOTICE: Your attendance in ${alert.course_code} (${alert.course_name}) is ${alert.attendance_percentage}% (<75%). Please contact your instructor.`,
      dispatched_by: actor_user_id,
      timestamp: dispatchTimestamp,
      status: 'DELIVERED',
    };
    inMemoryAlertDispatches.push(dispatchRecord);
    dispatched.push(dispatchRecord);
  }

  return {
    success: true,
    dispatched_count: dispatched.length,
    threshold,
    timestamp: dispatchTimestamp,
    dispatches: dispatched,
  };
};

module.exports = {
  createSession,
  findSessionById,
  findSessionsByCourse,
  updateSession,
  getStudentAttendanceSummary,
  getAttendanceAlerts,
  dispatchAttendanceAlerts,
  seedMockAttendance,
  inMemorySessions,
  inMemoryRecords,
  inMemoryAlertDispatches,
  VALID_STATUSES,
  TWENTY_FOUR_HOURS_MS,
  SHORTAGE_THRESHOLD,
};
