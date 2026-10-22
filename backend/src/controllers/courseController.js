/**
 * Course & Enrollment Controller
 * Requirement: SRS FR-03 (Course Catalog), FR-04 (Faculty Allocation & Student Enrollments)
 * Test Plan: TC-02, TC-03
 * Issue: #9 [SP-3] FR-03: Course & Faculty Assignment Catalog Management
 * Author: Kushitha K (@Kushitha30)
 */
const courseModel = require('../models/courseModel');
const studentModel = require('../models/studentModel');

/**
 * GET /api/v1/courses
 * List all courses in the catalog.
 * Accessible to Admin, Faculty, and Student.
 */
const getAllCourses = async (req, res) => {
  try {
    const { dept_id, semester, faculty_user_id, is_active, search, page, limit } = req.query;
    const result = await courseModel.findAll({ dept_id, semester, faculty_user_id, is_active, search, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: result.courses,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/courses/:id
 * Retrieve a specific course by course_id.
 */
const getCourseById = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course retrieved successfully',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/courses
 * Create a new course in the catalog (Admin only).
 */
const createCourse = async (req, res) => {
  try {
    const { course_code, course_name, credits, dept_id, semester, faculty_user_id } = req.body;

    if (!course_code || !course_name || credits === undefined || dept_id === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: course_code, course_name, credits, and dept_id are mandatory.',
      });
    }

    const creditsNum = Number(credits);
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credits value. Credits must be an integer between 1 and 10.',
      });
    }

    // Check duplicate course code
    const existingCode = await courseModel.findByCode(course_code);
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: 'Course code already exists.',
      });
    }

    const newCourse = await courseModel.create({
      course_code,
      course_name,
      credits: creditsNum,
      dept_id,
      semester,
      faculty_user_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message,
    });
  }
};

/**
 * PUT /api/v1/courses/:id
 * Update course details or assign faculty instructor (Admin only).
 */
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const existing = await courseModel.findById(courseId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (req.body.course_code && req.body.course_code.toUpperCase() !== existing.course_code.toUpperCase()) {
      const duplicate = await courseModel.findByCode(req.body.course_code);
      if (duplicate && duplicate.course_id !== existing.course_id) {
        return res.status(409).json({
          success: false,
          message: 'Course code already exists.',
        });
      }
    }

    const updated = await courseModel.update(courseId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/courses/:id/enroll
 * Enroll a student into a course (Admin or Faculty).
 */
const enrollStudent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { student_id, semester, academic_year } = req.body;

    if (!student_id || !semester || !academic_year) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: student_id, semester, and academic_year are required.',
      });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const student = await studentModel.findById(student_id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const enrollment = await courseModel.enrollStudent({
      student_id,
      course_id: courseId,
      semester,
      academic_year,
    });

    return res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment,
    });
  } catch (error) {
    if (error.code === '23505' || error.message.includes('already enrolled')) {
      return res.status(409).json({
        success: false,
        message: 'Student is already enrolled in this course for the selected semester.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to enroll student',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/courses/:id/roster
 * Get student enrollment roster for a course (Admin or Faculty).
 */
const getCourseRoster = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const roster = await courseModel.getCourseRoster(courseId);
    return res.status(200).json({
      success: true,
      data: roster,
      course: {
        course_id: course.course_id,
        course_code: course.course_code,
        course_name: course.course_name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve course roster',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/students/:id/enrollments
 * Retrieve enrollments for a student (Protected by object authorization).
 */
const getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const enrollments = await courseModel.getStudentEnrollments(studentId);
    return res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student enrollments',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  enrollStudent,
  getCourseRoster,
  getStudentEnrollments,
};
