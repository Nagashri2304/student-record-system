/**
 * Student Controller
 * Requirement: SRS FR-02 (Student Profile CRUD), SEC-01 / SEC-08 (Object Authorization)
 * Test Plan: TC-02, TC-07
 * Issue: #8 [SP-5] FR-02: Student Profile Management & Enrollment Lifecycle (CRUD)
 * Author: Kushitha K (@Kushitha30)
 */
const studentModel = require('../models/studentModel');

/**
 * GET /api/v1/students
 * List all students with filtering (dept_id, semester, search) and pagination.
 * Scoped to Admin and Faculty.
 */
const getAllStudents = async (req, res) => {
  try {
    const { dept_id, semester, search, is_active, page, limit } = req.query;
    const result = await studentModel.findAll({ dept_id, semester, search, is_active, page, limit });
    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: result.students,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/students/me
 * Retrieves profile of currently authenticated student.
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const student = await studentModel.findByUserId(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for the current user.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/students/:id
 * Retrieve a single student by student_id.
 * Protected by authorizeStudentAccess for IDOR prevention.
 */
const getStudentById = async (req, res) => {
  try {
    const student = await studentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/students
 * Create a new student record (Admin only).
 * Validates roll_number uniqueness (TC-02).
 */
const createStudent = async (req, res) => {
  try {
    const { roll_number, first_name, last_name, email, dept_id, semester, parent_user_id, user_id } = req.body;

    // Field validations
    if (!roll_number || !first_name || !last_name || !email || !dept_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: roll_number, first_name, last_name, email, and dept_id are mandatory.',
      });
    }

    // Check duplicate roll number (TC-02)
    const existingRoll = await studentModel.findByRollNumber(roll_number);
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: 'Roll number already exists.',
      });
    }

    // Check duplicate email
    const existingEmail = await studentModel.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'A student with this email address already exists.',
      });
    }

    const newStudent = await studentModel.create({
      user_id,
      roll_number,
      first_name,
      last_name,
      email,
      dept_id,
      semester,
      parent_user_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: newStudent,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Conflict: Unique constraint violation (roll number or email already in use).',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
};

/**
 * PUT /api/v1/students/:id
 * Update student profile (Admin or authorized updates).
 */
const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const existing = await studentModel.findById(studentId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // If changing roll_number, verify uniqueness
    if (req.body.roll_number && req.body.roll_number.toUpperCase() !== existing.roll_number.toUpperCase()) {
      const duplicate = await studentModel.findByRollNumber(req.body.roll_number);
      if (duplicate && duplicate.student_id !== existing.student_id) {
        return res.status(409).json({
          success: false,
          message: 'Roll number already exists.',
        });
      }
    }

    // If changing email, verify uniqueness
    if (req.body.email && req.body.email.toLowerCase() !== existing.email.toLowerCase()) {
      const duplicateEmail = await studentModel.findByEmail(req.body.email);
      if (duplicateEmail && duplicateEmail.student_id !== existing.student_id) {
        return res.status(409).json({
          success: false,
          message: 'Email address already in use.',
        });
      }
    }

    const updated = await studentModel.update(studentId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/v1/students/:id
 * Archive/soft-delete student record (Admin only).
 */
const archiveStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const existing = await studentModel.findById(studentId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const archived = await studentModel.archive(studentId);
    return res.status(200).json({
      success: true,
      message: 'Student archived successfully',
      data: archived,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to archive student',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/students/meta/departments
 * Retrieve academic departments for drop-downs and catalogs.
 */
const getDepartmentsList = async (req, res) => {
  try {
    const departments = await studentModel.getDepartments();
    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  getMyProfile,
  getStudentById,
  createStudent,
  updateStudent,
  archiveStudent,
  getDepartmentsList,
};
