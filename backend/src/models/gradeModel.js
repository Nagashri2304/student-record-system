/**
 * Grade Entry, Automated Letter Grade, GPA & Audit Logging Data Access Model
 * Requirement: SRS FR-05, FR-06, FR-07 (Subject Marks Entry, GPA Calculation, Audit Trail)
 * Test Plan: TC-05
 * Issue: #2 [SP-5] FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const db = require('../config/db');
const courseModel = require('./courseModel');

// In-memory grade and audit logs stores
const inMemoryGrades = new Map();
const inMemoryAuditLogs = [];

let nextGradeId = 1;
let nextAuditId = 1;

/**
 * Standard Institutional Grade Evaluation Scale
 * S: 90-100 (10 pts)
 * A: 80-89  (9 pts)
 * B: 70-79  (8 pts)
 * C: 60-69  (7 pts)
 * D: 50-59  (6 pts)
 * E: 40-49  (5 pts)
 * F: 0-39   (0 pts)
 */
const evaluateGrade = (marks) => {
  const numericMarks = Number(marks);
  if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
    const err = new Error(`Invalid mark value '${marks}'. Marks must be a number between 0 and 100.`);
    err.statusCode = 400;
    throw err;
  }

  if (numericMarks >= 90) return { letterGrade: 'S', gradePoints: 10 };
  if (numericMarks >= 80) return { letterGrade: 'A', gradePoints: 9 };
  if (numericMarks >= 70) return { letterGrade: 'B', gradePoints: 8 };
  if (numericMarks >= 60) return { letterGrade: 'C', gradePoints: 7 };
  if (numericMarks >= 50) return { letterGrade: 'D', gradePoints: 6 };
  if (numericMarks >= 40) return { letterGrade: 'E', gradePoints: 5 };
  return { letterGrade: 'F', gradePoints: 0 };
};

/**
 * Seed initial mock grades and audit records
 */
const seedMockGrades = () => {
  inMemoryGrades.clear();
  inMemoryAuditLogs.length = 0;
  nextGradeId = 1;
  nextAuditId = 1;

  const initialGrades = [
    {
      grade_id: 1,
      course_id: 1,
      student_id: 1,
      marks: 86,
      letter_grade: 'A',
      grade_points: 9,
      note: 'Initial end-semester evaluation',
      created_by: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      grade_id: 2,
      course_id: 2,
      student_id: 1,
      marks: 92,
      letter_grade: 'S',
      grade_points: 10,
      note: 'Final assessment submission',
      created_by: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      grade_id: 3,
      course_id: 1,
      student_id: 2,
      marks: 74,
      letter_grade: 'B',
      grade_points: 8,
      note: 'First evaluation',
      created_by: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const g of initialGrades) {
    inMemoryGrades.set(g.grade_id, g);
    inMemoryAuditLogs.push({
      audit_id: nextAuditId++,
      action: 'GRADE_SUBMITTED',
      course_id: g.course_id,
      student_id: g.student_id,
      old_marks: null,
      new_marks: g.marks,
      letter_grade: g.letter_grade,
      note: g.note,
      actor_user_id: g.created_by,
      timestamp: g.created_at,
    });
  }
  nextGradeId = 4;
};

// Initialize mock store
seedMockGrades();

/**
 * Submit or amend grades for a course batch
 */
const submitGrades = async ({ course_id, faculty_user_id, grades = [] }) => {
  const numericCourseId = parseInt(course_id, 10);
  const numericFacultyId = parseInt(faculty_user_id, 10);
  const now = new Date().toISOString();

  if (!Array.isArray(grades) || grades.length === 0) {
    throw new Error('Grade submission batch must contain at least one grade record.');
  }

  // Pre-validate all records and prevent duplicate students in the same batch
  const seenStudentIds = new Set();
  for (const item of grades) {
    const studentId = parseInt(item.student_id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      const err = new Error('Invalid student_id provided in grade batch.');
      err.statusCode = 400;
      throw err;
    }
    if (seenStudentIds.has(studentId)) {
      const err = new Error(`Duplicate grade record for student_id ${studentId} in the same batch.`);
      err.statusCode = 400;
      throw err;
    }
    seenStudentIds.add(studentId);

    if (item.marks === undefined || item.marks === null || item.marks === '') {
      const err = new Error(`Marks value is mandatory for student_id ${studentId}.`);
      err.statusCode = 400;
      throw err;
    }

    const numericMarks = Number(item.marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      const err = new Error(`Mark value '${item.marks}' is invalid for student_id ${studentId}. Marks must be between 0 and 100.`);
      err.statusCode = 400;
      throw err;
    }
  }

  // Database transaction execution when db.pool is active
  if (db.pool) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const item of grades) {
        const studentId = parseInt(item.student_id, 10);
        const numericMarks = Number(item.marks);
        const { letterGrade, gradePoints } = evaluateGrade(numericMarks);

        const checkRes = await client.query(
          'SELECT * FROM grades WHERE course_id = $1 AND student_id = $2',
          [numericCourseId, studentId]
        );
        const existingGrade = checkRes.rows[0];

        if (existingGrade) {
          const note = (item.note || item.amendment_reason || '').trim();
          if (!note || note.length < 5) {
            const err = new Error(
              `Mandatory explanation note is required for grade amendments (student_id: ${studentId}).`
            );
            err.statusCode = 400;
            err.code = 'NOTE_REQUIRED';
            throw err;
          }

          const oldMarks = existingGrade.marks;
          const updateRes = await client.query(
            `UPDATE grades
             SET marks = $1, letter_grade = $2, grade_points = $3, note = $4, updated_by = $5, updated_at = $6
             WHERE grade_id = $7
             RETURNING *`,
            [numericMarks, letterGrade, gradePoints, note, numericFacultyId, now, existingGrade.grade_id]
          );
          const updatedGrade = updateRes.rows[0];

          const auditRes = await client.query(
            `INSERT INTO audit_logs (action, course_id, student_id, old_marks, new_marks, letter_grade, note, actor_user_id, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            ['GRADE_AMENDMENT', numericCourseId, studentId, oldMarks, numericMarks, letterGrade, note, numericFacultyId, now]
          );
          results.push({ ...updatedGrade, audit: auditRes.rows[0] });
        } else {
          const note = (item.note || 'Initial grade submission').trim();
          const insertRes = await client.query(
            `INSERT INTO grades (course_id, student_id, marks, letter_grade, grade_points, note, created_by, updated_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $8)
             RETURNING *`,
            [numericCourseId, studentId, numericMarks, letterGrade, gradePoints, note, numericFacultyId, now]
          );
          const newGrade = insertRes.rows[0];

          const auditRes = await client.query(
            `INSERT INTO audit_logs (action, course_id, student_id, old_marks, new_marks, letter_grade, note, actor_user_id, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            ['GRADE_SUBMITTED', numericCourseId, studentId, null, numericMarks, letterGrade, note, numericFacultyId, now]
          );
          results.push({ ...newGrade, audit: auditRes.rows[0] });
        }
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {}
      throw err;
    } finally {
      client.release();
    }
  }

  // In-memory fallback execution
  const results = [];

  for (const item of grades) {
    const studentId = parseInt(item.student_id, 10);
    if (isNaN(studentId) || studentId <= 0) {
      const err = new Error('Invalid student_id provided in grade batch.');
      err.statusCode = 400;
      throw err;
    }

    // Marks validation in [0, 100]
    if (item.marks === undefined || item.marks === null || item.marks === '') {
      const err = new Error(`Marks value is mandatory for student_id ${studentId}.`);
      err.statusCode = 400;
      throw err;
    }

    const numericMarks = Number(item.marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      const err = new Error(`Mark value '${item.marks}' is invalid for student_id ${studentId}. Marks must be between 0 and 100.`);
      err.statusCode = 400;
      throw err;
    }

    // Auto-evaluate letter grade and grade points
    const { letterGrade, gradePoints } = evaluateGrade(numericMarks);

    // Check if an existing grade record exists for this (course_id, student_id)
    let existingGrade = null;
    for (const g of inMemoryGrades.values()) {
      if (g.course_id === numericCourseId && g.student_id === studentId) {
        existingGrade = g;
        break;
      }
    }

    if (existingGrade) {
      // Grade Amendment Requirement: Mandatory explanation note!
      const note = (item.note || item.amendment_reason || '').trim();
      if (!note || note.length < 5) {
        const err = new Error(
          `Mandatory explanation note is required for grade amendments (student_id: ${studentId}).`
        );
        err.statusCode = 400;
        err.code = 'NOTE_REQUIRED';
        throw err;
      }

      const oldMarks = existingGrade.marks;
      existingGrade.marks = numericMarks;
      existingGrade.letter_grade = letterGrade;
      existingGrade.grade_points = gradePoints;
      existingGrade.note = note;
      existingGrade.updated_at = now;
      existingGrade.updated_by = numericFacultyId;

      // Log transaction in audit trail
      const auditEntry = {
        audit_id: nextAuditId++,
        action: 'GRADE_AMENDMENT',
        course_id: numericCourseId,
        student_id: studentId,
        old_marks: oldMarks,
        new_marks: numericMarks,
        letter_grade: letterGrade,
        note,
        actor_user_id: numericFacultyId,
        timestamp: now,
      };
      inMemoryAuditLogs.push(auditEntry);
      results.push({ ...existingGrade, audit: auditEntry });
    } else {
      // First-time grade submission
      const gradeId = nextGradeId++;
      const note = (item.note || 'Initial grade submission').trim();
      const newGrade = {
        grade_id: gradeId,
        course_id: numericCourseId,
        student_id: studentId,
        marks: numericMarks,
        letter_grade: letterGrade,
        grade_points: gradePoints,
        note,
        created_by: numericFacultyId,
        created_at: now,
        updated_at: now,
      };
      inMemoryGrades.set(gradeId, newGrade);

      // Log transaction in audit trail
      const auditEntry = {
        audit_id: nextAuditId++,
        action: 'GRADE_SUBMITTED',
        course_id: numericCourseId,
        student_id: studentId,
        old_marks: null,
        new_marks: numericMarks,
        letter_grade: letterGrade,
        note,
        actor_user_id: numericFacultyId,
        timestamp: now,
      };
      inMemoryAuditLogs.push(auditEntry);
      results.push({ ...newGrade, audit: auditEntry });
    }
  }

  return results;
};

/**
 * Retrieve all grades for a specific course
 */
const findGradesByCourse = async (courseId) => {
  const numericCourseId = parseInt(courseId, 10);

  if (db.pool) {
    try {
      const res = await db.query(
        'SELECT * FROM grades WHERE course_id = $1 ORDER BY student_id ASC',
        [numericCourseId]
      );
      return res.rows;
    } catch (err) {}
  }

  const courseGrades = [];
  for (const g of inMemoryGrades.values()) {
    if (g.course_id === numericCourseId) {
      courseGrades.push(g);
    }
  }

  return courseGrades;
};

/**
 * Retrieve all grades for a student and automatically calculate weighted GPA
 */
const findGradesByStudent = async (studentId) => {
  const numericStudentId = parseInt(studentId, 10);

  if (db.pool) {
    try {
      const res = await db.query(
        `SELECT g.*, c.course_code, c.course_name, c.credits
         FROM grades g
         JOIN courses c ON g.course_id = c.course_id
         WHERE g.student_id = $1`,
        [numericStudentId]
      );
      if (res.rows.length > 0) {
        let totalCreditPoints = 0;
        let totalCredits = 0;
        for (const row of res.rows) {
          const credits = row.credits || 3;
          totalCredits += credits;
          totalCreditPoints += credits * row.grade_points;
        }
        const computedGpa = totalCredits > 0
          ? Number((totalCreditPoints / totalCredits).toFixed(2))
          : 0.0;
        return {
          student_id: numericStudentId,
          totalCourses: res.rows.length,
          totalCredits,
          gpa: computedGpa,
          grades: res.rows,
        };
      }
    } catch (err) {}
  }

  const studentGrades = [];
  let totalCreditPoints = 0;
  let totalCredits = 0;

  for (const g of inMemoryGrades.values()) {
    if (g.student_id === numericStudentId) {
      const course = await courseModel.findById(g.course_id);
      const credits = course ? course.credits : 3;

      totalCredits += credits;
      totalCreditPoints += credits * g.grade_points;

      studentGrades.push({
        ...g,
        course_code: course ? course.course_code : `COURSE-${g.course_id}`,
        course_name: course ? course.course_name : 'Unknown Course',
        credits,
      });
    }
  }

  const computedGpa = totalCredits > 0
    ? Number((totalCreditPoints / totalCredits).toFixed(2))
    : 0.0;

  return {
    student_id: numericStudentId,
    totalCourses: studentGrades.length,
    totalCredits,
    gpa: computedGpa,
    grades: studentGrades,
  };
};

/**
 * Query the immutable audit logs
 */
const getAuditLogs = async ({ course_id, student_id, actor_user_id } = {}) => {
  if (db.pool) {
    try {
      const conditions = [];
      const values = [];
      let idx = 1;
      if (course_id) {
        conditions.push(`course_id = $${idx++}`);
        values.push(parseInt(course_id, 10));
      }
      if (student_id) {
        conditions.push(`student_id = $${idx++}`);
        values.push(parseInt(student_id, 10));
      }
      if (actor_user_id) {
        conditions.push(`actor_user_id = $${idx++}`);
        values.push(parseInt(actor_user_id, 10));
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await db.query(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC`,
        values
      );
      return res.rows;
    } catch (err) {}
  }

  let logs = [...inMemoryAuditLogs];

  if (course_id) {
    const cId = parseInt(course_id, 10);
    logs = logs.filter((l) => l.course_id === cId);
  }
  if (student_id) {
    const sId = parseInt(student_id, 10);
    logs = logs.filter((l) => l.student_id === sId);
  }
  if (actor_user_id) {
    const aId = parseInt(actor_user_id, 10);
    logs = logs.filter((l) => l.actor_user_id === aId);
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

module.exports = {
  submitGrades,
  findGradesByCourse,
  findGradesByStudent,
  getAuditLogs,
  evaluateGrade,
  seedMockGrades,
};
