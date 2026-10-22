/**
 * Student Data Access Model & Validation Store
 * Requirement: SRS FR-02 (Student Profile CRUD), SEC-08 / NFR-06 (Object-Level Authorization & Zero IDOR)
 * Test Plan: TC-02, TC-07
 * Issue: #8 [SP-5] FR-02: Student Profile Management & Enrollment Lifecycle (CRUD)
 * Author: Kushitha K (@Kushitha30)
 */
const db = require('../config/db');

// In-memory student and department store for testing & standalone execution
const inMemoryStudents = new Map();
const inMemoryDepartments = [
  { dept_id: 1, dept_code: 'CSE', dept_name: 'Computer Science & Engineering' },
  { dept_id: 2, dept_code: 'ECE', dept_name: 'Electronics & Communication Engineering' },
  { dept_id: 3, dept_code: 'ISE', dept_name: 'Information Science & Engineering' },
  { dept_id: 4, dept_code: 'ME', dept_name: 'Mechanical Engineering' },
];

let nextStudentId = 1;

/**
 * Reset / Seed in-memory students
 */
const seedMockStudents = () => {
  inMemoryStudents.clear();
  nextStudentId = 1;

  const initialStudents = [
    {
      student_id: 1,
      user_id: 3, // Linked to student@edutrack.edu from userModel
      roll_number: 'USN2026CS001',
      first_name: 'Aarav',
      last_name: 'Sharma',
      email: 'student@edutrack.edu',
      dept_id: 1,
      dept_code: 'CSE',
      dept_name: 'Computer Science & Engineering',
      semester: 4,
      parent_user_id: 4, // Linked to parent@edutrack.edu
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      student_id: 2,
      user_id: 102,
      roll_number: 'USN2026CS002',
      first_name: 'Bhavya',
      last_name: 'Patel',
      email: 'bhavya@edutrack.edu',
      dept_id: 1,
      dept_code: 'CSE',
      dept_name: 'Computer Science & Engineering',
      semester: 4,
      parent_user_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const s of initialStudents) {
    inMemoryStudents.set(s.student_id, { ...s });
  }
  nextStudentId = 3;
};

// Seed on initialization
seedMockStudents();

/**
 * Get all departments
 */
const getDepartments = async () => {
  if (db.pool) {
    const res = await db.query('SELECT * FROM departments ORDER BY dept_id ASC');
    return res.rows;
  }
  return [...inMemoryDepartments];
};

/**
 * Find department by ID
 */
const findDepartmentById = async (deptId) => {
  if (db.pool) {
    const res = await db.query('SELECT * FROM departments WHERE dept_id = $1', [deptId]);
    return res.rows[0] || null;
  }
  return inMemoryDepartments.find((d) => d.dept_id === Number(deptId)) || null;
};

/**
 * Find student by student_id
 */
const findById = async (studentId) => {
  const idNum = Number(studentId);
  if (db.pool) {
    const res = await db.query(
      `SELECT s.*, d.dept_code, d.dept_name
       FROM students s
       LEFT JOIN departments d ON s.dept_id = d.dept_id
       WHERE s.student_id = $1`,
      [idNum]
    );
    return res.rows[0] || null;
  }

  const s = inMemoryStudents.get(idNum);
  return s ? { ...s } : null;
};

/**
 * Find student by user_id
 */
const findByUserId = async (userId) => {
  const idNum = Number(userId);
  if (db.pool) {
    const res = await db.query(
      `SELECT s.*, d.dept_code, d.dept_name
       FROM students s
       LEFT JOIN departments d ON s.dept_id = d.dept_id
       WHERE s.user_id = $1`,
      [idNum]
    );
    return res.rows[0] || null;
  }

  for (const s of inMemoryStudents.values()) {
    if (s.user_id === idNum) {
      return { ...s };
    }
  }
  return null;
};

/**
 * Find student by roll_number (case-insensitive)
 */
const findByRollNumber = async (rollNumber) => {
  if (!rollNumber) return null;
  const normalized = rollNumber.trim().toUpperCase();

  if (db.pool) {
    const res = await db.query(
      `SELECT s.*, d.dept_code, d.dept_name
       FROM students s
       LEFT JOIN departments d ON s.dept_id = d.dept_id
       WHERE UPPER(s.roll_number) = $1`,
      [normalized]
    );
    return res.rows[0] || null;
  }

  for (const s of inMemoryStudents.values()) {
    if (s.roll_number && s.roll_number.toUpperCase() === normalized) {
      return { ...s };
    }
  }
  return null;
};

/**
 * Find student by email
 */
const findByEmail = async (email) => {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();

  if (db.pool) {
    const res = await db.query(
      `SELECT s.*, d.dept_code, d.dept_name
       FROM students s
       LEFT JOIN departments d ON s.dept_id = d.dept_id
       WHERE LOWER(s.email) = $1`,
      [normalized]
    );
    return res.rows[0] || null;
  }

  for (const s of inMemoryStudents.values()) {
    if (s.email && s.email.toLowerCase() === normalized) {
      return { ...s };
    }
  }
  return null;
};

/**
 * List students with filtering and pagination
 */
const findAll = async ({ dept_id, semester, search, is_active, page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const offset = (pageNum - 1) * limitNum;

  if (db.pool) {
    let whereClauses = [];
    let params = [];
    let idx = 1;

    if (dept_id !== undefined && dept_id !== null && dept_id !== '') {
      whereClauses.push(`s.dept_id = $${idx++}`);
      params.push(Number(dept_id));
    }
    if (semester !== undefined && semester !== null && semester !== '') {
      whereClauses.push(`s.semester = $${idx++}`);
      params.push(Number(semester));
    }
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      whereClauses.push(`s.is_active = $${idx++}`);
      params.push(is_active === 'true' || is_active === true);
    }
    if (search) {
      whereClauses.push(`(s.roll_number ILIKE $${idx} OR s.first_name ILIKE $${idx} OR s.last_name ILIKE $${idx} OR s.email ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) AS total FROM students s ${whereStr}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const listQuery = `
      SELECT s.*, d.dept_code, d.dept_name
      FROM students s
      LEFT JOIN departments d ON s.dept_id = d.dept_id
      ${whereStr}
      ORDER BY s.student_id ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limitNum, offset);

    const listRes = await db.query(listQuery, params);
    return {
      students: listRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // In-memory query logic
  let results = Array.from(inMemoryStudents.values());

  if (dept_id !== undefined && dept_id !== null && dept_id !== '') {
    results = results.filter((s) => s.dept_id === Number(dept_id));
  }
  if (semester !== undefined && semester !== null && semester !== '') {
    results = results.filter((s) => s.semester === Number(semester));
  }
  if (is_active !== undefined && is_active !== null && is_active !== '') {
    const act = is_active === 'true' || is_active === true;
    results = results.filter((s) => s.is_active === act);
  }
  if (search) {
    const term = search.toLowerCase().trim();
    results = results.filter(
      (s) =>
        (s.roll_number && s.roll_number.toLowerCase().includes(term)) ||
        (s.first_name && s.first_name.toLowerCase().includes(term)) ||
        (s.last_name && s.last_name.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
    );
  }

  const total = results.length;
  const paginated = results.slice(offset, offset + limitNum);

  return {
    students: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Create a new student record
 */
const create = async ({
  user_id = null,
  roll_number,
  first_name,
  last_name,
  email,
  dept_id,
  semester = 1,
  parent_user_id = null,
}) => {
  const normRoll = roll_number.trim().toUpperCase();
  const normEmail = email.trim().toLowerCase();
  const dept = await findDepartmentById(dept_id);

  if (db.pool) {
    const res = await db.query(
      `INSERT INTO students (user_id, roll_number, first_name, last_name, email, dept_id, semester, parent_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, normRoll, first_name.trim(), last_name.trim(), normEmail, dept_id, semester, parent_user_id]
    );
    const created = res.rows[0];
    return {
      ...created,
      dept_code: dept ? dept.dept_code : null,
      dept_name: dept ? dept.dept_name : null,
    };
  }

  const student_id = nextStudentId++;
  const newStudent = {
    student_id,
    user_id: user_id ? Number(user_id) : null,
    roll_number: normRoll,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normEmail,
    dept_id: Number(dept_id),
    dept_code: dept ? dept.dept_code : 'CSE',
    dept_name: dept ? dept.dept_name : 'Computer Science & Engineering',
    semester: Number(semester) || 1,
    parent_user_id: parent_user_id ? Number(parent_user_id) : null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  inMemoryStudents.set(student_id, newStudent);
  return { ...newStudent };
};

/**
 * Update an existing student record
 */
const update = async (studentId, fields) => {
  const idNum = Number(studentId);
  const existing = await findById(idNum);
  if (!existing) return null;

  const dept = fields.dept_id !== undefined ? await findDepartmentById(fields.dept_id) : await findDepartmentById(existing.dept_id);

  if (db.pool) {
    const allowed = ['roll_number', 'first_name', 'last_name', 'email', 'dept_id', 'semester', 'parent_user_id', 'is_active'];
    let sets = [];
    let params = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx++}`);
        if (key === 'roll_number') params.push(fields[key].trim().toUpperCase());
        else if (key === 'email') params.push(fields[key].trim().toLowerCase());
        else params.push(fields[key]);
      }
    }

    if (sets.length === 0) return existing;

    sets.push(`updated_at = CURRENT_TIMESTAMP`);
    const query = `UPDATE students SET ${sets.join(', ')} WHERE student_id = $${idx} RETURNING *`;
    params.push(idNum);

    const res = await db.query(query, params);
    return {
      ...res.rows[0],
      dept_code: dept ? dept.dept_code : null,
      dept_name: dept ? dept.dept_name : null,
    };
  }

  const updated = {
    ...existing,
    ...fields,
    roll_number: fields.roll_number ? fields.roll_number.trim().toUpperCase() : existing.roll_number,
    email: fields.email ? fields.email.trim().toLowerCase() : existing.email,
    dept_id: fields.dept_id !== undefined ? Number(fields.dept_id) : existing.dept_id,
    dept_code: dept ? dept.dept_code : existing.dept_code,
    dept_name: dept ? dept.dept_name : existing.dept_name,
    semester: fields.semester !== undefined ? Number(fields.semester) : existing.semester,
    updated_at: new Date().toISOString(),
  };

  inMemoryStudents.set(idNum, updated);
  return { ...updated };
};

/**
 * Soft delete or archive student
 */
const archive = async (studentId) => {
  return await update(studentId, { is_active: false });
};

/**
 * Hard delete student (if required)
 */
const remove = async (studentId) => {
  const idNum = Number(studentId);
  if (db.pool) {
    const res = await db.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [idNum]);
    return res.rows[0] || null;
  }

  const existing = inMemoryStudents.get(idNum);
  if (existing) {
    inMemoryStudents.delete(idNum);
    return existing;
  }
  return null;
};

module.exports = {
  seedMockStudents,
  getDepartments,
  findDepartmentById,
  findById,
  findByUserId,
  findByRollNumber,
  findByEmail,
  findAll,
  create,
  update,
  archive,
  remove,
};
