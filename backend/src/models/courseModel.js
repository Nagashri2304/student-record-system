/**
 * Course Catalog & Faculty Allocation Data Access Model
 * Requirement: SRS FR-03 (Course Catalog Management), FR-04 (Faculty Allocation & Enrollments)
 * Test Plan: TC-02, TC-03
 * Issue: #9 [SP-3] FR-03: Course & Faculty Assignment Catalog Management
 * Author: Kushitha K (@Kushitha30)
 */
const db = require('../config/db');

// In-memory courses & enrollments store for testing and standalone execution
const inMemoryCourses = new Map();
const inMemoryEnrollments = new Map();

let nextCourseId = 1;
let nextEnrollmentId = 1;

/**
 * Seed initial courses & allocations
 */
const seedMockCourses = () => {
  inMemoryCourses.clear();
  inMemoryEnrollments.clear();
  nextCourseId = 1;
  nextEnrollmentId = 1;

  const initialCourses = [
    {
      course_id: 1,
      course_code: 'CS101',
      course_name: 'Data Structures and Algorithms',
      credits: 4,
      dept_id: 1,
      dept_code: 'CSE',
      semester: 3,
      faculty_user_id: 2, // Faculty user
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      course_id: 2,
      course_code: 'CS102',
      course_name: 'Database Management Systems',
      credits: 3,
      dept_id: 1,
      dept_code: 'CSE',
      semester: 4,
      faculty_user_id: 2,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      course_id: 3,
      course_code: 'MA101',
      course_name: 'Discrete Mathematics and Graph Theory',
      credits: 4,
      dept_id: 1,
      dept_code: 'CSE',
      semester: 3,
      faculty_user_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const c of initialCourses) {
    inMemoryCourses.set(c.course_id, { ...c });
  }
  nextCourseId = 4;

  // Initial Enrollment: Student 1 enrolled in CS101 and CS102
  const initialEnrollments = [
    {
      enrollment_id: 1,
      student_id: 1,
      course_id: 1,
      semester: 3,
      academic_year: '2025-2026',
      created_at: new Date().toISOString(),
    },
    {
      enrollment_id: 2,
      student_id: 1,
      course_id: 2,
      semester: 4,
      academic_year: '2025-2026',
      created_at: new Date().toISOString(),
    },
  ];

  for (const e of initialEnrollments) {
    inMemoryEnrollments.set(e.enrollment_id, { ...e });
  }
  nextEnrollmentId = 3;
};

// Seed on module load
seedMockCourses();

/**
 * Find course by course_id
 */
const findById = async (courseId) => {
  const idNum = Number(courseId);
  if (db.pool) {
    const res = await db.query(
      `SELECT c.*, d.dept_code, d.dept_name, u.email AS faculty_email
       FROM courses c
       LEFT JOIN departments d ON c.dept_id = d.dept_id
       LEFT JOIN users u ON c.faculty_user_id = u.user_id
       WHERE c.course_id = $1`,
      [idNum]
    );
    return res.rows[0] || null;
  }

  const c = inMemoryCourses.get(idNum);
  return c ? { ...c } : null;
};

/**
 * Find course by course_code (case-insensitive)
 */
const findByCode = async (courseCode) => {
  if (!courseCode) return null;
  const normalized = courseCode.trim().toUpperCase();

  if (db.pool) {
    const res = await db.query(
      `SELECT c.*, d.dept_code, d.dept_name, u.email AS faculty_email
       FROM courses c
       LEFT JOIN departments d ON c.dept_id = d.dept_id
       LEFT JOIN users u ON c.faculty_user_id = u.user_id
       WHERE UPPER(c.course_code) = $1`,
      [normalized]
    );
    return res.rows[0] || null;
  }

  for (const c of inMemoryCourses.values()) {
    if (c.course_code && c.course_code.toUpperCase() === normalized) {
      return { ...c };
    }
  }
  return null;
};

/**
 * List courses with filtering and pagination
 */
const findAll = async ({ dept_id, semester, faculty_user_id, is_active, search, page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const offset = (pageNum - 1) * limitNum;

  if (db.pool) {
    let whereClauses = [];
    let params = [];
    let idx = 1;

    if (dept_id !== undefined && dept_id !== null && dept_id !== '') {
      whereClauses.push(`c.dept_id = $${idx++}`);
      params.push(Number(dept_id));
    }
    if (semester !== undefined && semester !== null && semester !== '') {
      whereClauses.push(`c.semester = $${idx++}`);
      params.push(Number(semester));
    }
    if (faculty_user_id !== undefined && faculty_user_id !== null && faculty_user_id !== '') {
      whereClauses.push(`c.faculty_user_id = $${idx++}`);
      params.push(Number(faculty_user_id));
    }
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      whereClauses.push(`c.is_active = $${idx++}`);
      params.push(is_active === 'true' || is_active === true);
    }
    if (search) {
      whereClauses.push(`(c.course_code ILIKE $${idx} OR c.course_name ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const countQuery = `SELECT COUNT(*) AS total FROM courses c ${whereStr}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const listQuery = `
      SELECT c.*, d.dept_code, d.dept_name, u.email AS faculty_email
      FROM courses c
      LEFT JOIN departments d ON c.dept_id = d.dept_id
      LEFT JOIN users u ON c.faculty_user_id = u.user_id
      ${whereStr}
      ORDER BY c.course_id ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limitNum, offset);
    const listRes = await db.query(listQuery, params);

    return {
      courses: listRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // In-memory filtering
  let results = Array.from(inMemoryCourses.values());

  if (dept_id !== undefined && dept_id !== null && dept_id !== '') {
    results = results.filter((c) => c.dept_id === Number(dept_id));
  }
  if (semester !== undefined && semester !== null && semester !== '') {
    results = results.filter((c) => c.semester === Number(semester));
  }
  if (faculty_user_id !== undefined && faculty_user_id !== null && faculty_user_id !== '') {
    results = results.filter((c) => c.faculty_user_id === Number(faculty_user_id));
  }
  if (is_active !== undefined && is_active !== null && is_active !== '') {
    const act = is_active === 'true' || is_active === true;
    results = results.filter((c) => c.is_active === act);
  }
  if (search) {
    const term = search.toLowerCase().trim();
    results = results.filter(
      (c) =>
        (c.course_code && c.course_code.toLowerCase().includes(term)) ||
        (c.course_name && c.course_name.toLowerCase().includes(term))
    );
  }

  const total = results.length;
  const paginated = results.slice(offset, offset + limitNum);

  return {
    courses: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Create a new course entry
 */
const create = async ({ course_code, course_name, credits, dept_id, semester = 1, faculty_user_id = null }) => {
  const normCode = course_code.trim().toUpperCase();

  if (db.pool) {
    const res = await db.query(
      `INSERT INTO courses (course_code, course_name, credits, dept_id, semester, faculty_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [normCode, course_name.trim(), Number(credits), Number(dept_id), Number(semester), faculty_user_id]
    );
    return res.rows[0];
  }

  const course_id = nextCourseId++;
  const newCourse = {
    course_id,
    course_code: normCode,
    course_name: course_name.trim(),
    credits: Number(credits),
    dept_id: Number(dept_id),
    dept_code: dept_id === 1 ? 'CSE' : 'OTHER',
    semester: Number(semester) || 1,
    faculty_user_id: faculty_user_id ? Number(faculty_user_id) : null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryCourses.set(course_id, newCourse);
  return { ...newCourse };
};

/**
 * Update course details or assign faculty
 */
const update = async (courseId, fields) => {
  const idNum = Number(courseId);
  const existing = await findById(idNum);
  if (!existing) return null;

  if (db.pool) {
    const allowed = ['course_code', 'course_name', 'credits', 'dept_id', 'semester', 'faculty_user_id', 'is_active'];
    let sets = [];
    let params = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        if (key === 'course_code') params.push(fields[key].trim().toUpperCase());
        else params.push(fields[key]);
      }
    }

    if (sets.length === 0) return existing;
    sets.push(`updated_at = CURRENT_TIMESTAMP`);
    const query = `UPDATE courses SET ${sets.join(', ')} WHERE course_id = $${idx} RETURNING *`;
    params.push(idNum);

    const res = await db.query(query, params);
    return res.rows[0];
  }

  const updated = {
    ...existing,
    ...fields,
    course_code: fields.course_code ? fields.course_code.trim().toUpperCase() : existing.course_code,
    credits: fields.credits !== undefined ? Number(fields.credits) : existing.credits,
    dept_id: fields.dept_id !== undefined ? Number(fields.dept_id) : existing.dept_id,
    semester: fields.semester !== undefined ? Number(fields.semester) : existing.semester,
    faculty_user_id: fields.faculty_user_id !== undefined ? (fields.faculty_user_id ? Number(fields.faculty_user_id) : null) : existing.faculty_user_id,
    updated_at: new Date().toISOString(),
  };

  inMemoryCourses.set(idNum, updated);
  return { ...updated };
};

/**
 * Enroll a student in a course
 */
const enrollStudent = async ({ student_id, course_id, semester, academic_year }) => {
  const sId = Number(student_id);
  const cId = Number(course_id);
  const sem = Number(semester);
  const year = academic_year.trim();

  if (db.pool) {
    const res = await db.query(
      `INSERT INTO enrollments (student_id, course_id, semester, academic_year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sId, cId, sem, year]
    );
    return res.rows[0];
  }

  // Check unique constraint: (student_id, course_id, semester)
  for (const e of inMemoryEnrollments.values()) {
    if (e.student_id === sId && e.course_id === cId && e.semester === sem) {
      const err = new Error('Student is already enrolled in this course for the selected semester');
      err.code = '23505'; // PostgreSQL unique_violation code
      throw err;
    }
  }

  const enrollment_id = nextEnrollmentId++;
  const newEnrollment = {
    enrollment_id,
    student_id: sId,
    course_id: cId,
    semester: sem,
    academic_year: year,
    created_at: new Date().toISOString(),
  };

  inMemoryEnrollments.set(enrollment_id, newEnrollment);
  return { ...newEnrollment };
};

/**
 * Get enrollments for a student
 */
const getStudentEnrollments = async (studentId) => {
  const sId = Number(studentId);
  if (db.pool) {
    const res = await db.query(
      `SELECT e.*, c.course_code, c.course_name, c.credits, d.dept_code
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN departments d ON c.dept_id = d.dept_id
       WHERE e.student_id = $1
       ORDER BY e.semester ASC, c.course_code ASC`,
      [sId]
    );
    return res.rows;
  }

  const results = [];
  for (const e of inMemoryEnrollments.values()) {
    if (e.student_id === sId) {
      const course = inMemoryCourses.get(e.course_id) || {};
      results.push({
        ...e,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        dept_code: course.dept_code,
      });
    }
  }
  return results;
};

/**
 * Get enrolled roster for a course
 */
const getCourseRoster = async (courseId) => {
  const cId = Number(courseId);
  if (db.pool) {
    const res = await db.query(
      `SELECT e.enrollment_id, e.semester, e.academic_year, s.student_id, s.roll_number, s.first_name, s.last_name, s.email, s.is_active
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       WHERE e.course_id = $1
       ORDER BY s.roll_number ASC`,
      [cId]
    );
    return res.rows;
  }

  const studentModel = require('./studentModel');
  const results = [];
  for (const e of inMemoryEnrollments.values()) {
    if (e.course_id === cId) {
      const s = await studentModel.findById(e.student_id);
      if (s) {
        results.push({
          enrollment_id: e.enrollment_id,
          semester: e.semester,
          academic_year: e.academic_year,
          student_id: s.student_id,
          roll_number: s.roll_number,
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email,
          is_active: s.is_active !== undefined ? s.is_active : true,
        });
      }
    }
  }
  return results;
};

module.exports = {
  seedMockCourses,
  findById,
  findByCode,
  findAll,
  create,
  update,
  enrollStudent,
  getStudentEnrollments,
  getCourseRoster,
};
