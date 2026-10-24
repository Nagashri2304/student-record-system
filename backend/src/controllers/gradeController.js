/**
 * Subject Marks Entry, Automatic GPA & Audit Logging Controller
 * Requirement: SRS FR-05, FR-06, FR-07; Test Plan TC-05
 * Issue: #2 [SP-5] FR-05: Subject Marks Entry & Automatic GPA / Grade Evaluation
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const gradeModel = require('../models/gradeModel');
const courseModel = require('../models/courseModel');
const studentModel = require('../models/studentModel');

/**
 * POST /api/v1/courses/:id/grades
 * Batch submit or amend student marks for a course.
 * Accessible to Faculty and Admin.
 */
const submitCourseGrades = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    if (course.is_active === false) {
      return res.status(409).json({ success: false, message: 'Grades cannot be recorded for an inactive course.' });
    }
    if (req.user.role === 'Faculty' && course.faculty_user_id !== null && Number(course.faculty_user_id) !== Number(req.user.user_id)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to teach this course.' });
    }

    const { grades } = req.body;
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade submission requires a non-empty grades array.',
      });
    }

    for (const item of grades) {
      const studentId = Number(item?.student_id);
      if (!Number.isSafeInteger(studentId) || studentId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid student_id provided in grade batch.' });
      }
      const student = await studentModel.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found.` });
      }
      if (student.is_active === false) {
        return res.status(409).json({ success: false, message: 'Grades cannot be recorded for an inactive student.' });
      }
    }

    const recordedGrades = await gradeModel.submitGrades({
      course_id: courseId,
      faculty_user_id: req.user.user_id,
      grades,
    });

    return res.status(200).json({
      success: true,
      message: 'Grades recorded and evaluated successfully.',
      data: recordedGrades,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.code === 'NOTE_REQUIRED' || error.message.includes('Invalid') ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      code: error.code || 'GRADE_SUBMISSION_FAILED',
    });
  }
};

/**
 * GET /api/v1/courses/:id/grades
 * Retrieve all grades recorded for a course.
 * Accessible to Faculty and Admin.
 */
const getCourseGrades = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const grades = await gradeModel.findGradesByCourse(courseId);

    return res.status(200).json({
      success: true,
      message: 'Course grades retrieved successfully.',
      data: grades,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/students/:id/grades
 * Retrieve a student's grades and computed GPA across all enrolled courses.
 * Protected by IDOR object authorization guards.
 */
const getStudentGrades = async (req, res) => {
  try {
    let studentId;

    if (req.params.id === 'me') {
      const student = await studentModel.findByUserId(req.user.user_id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found for this user.' });
      }
      studentId = student.student_id;
    } else {
      studentId = parseInt(req.params.id, 10);
      const student = await studentModel.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      // IDOR Authorization: Student can only access own; Parent can only access linked child
      if (req.user.role === 'Student' && req.user.user_id !== student.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this resource.',
        });
      }
      if (req.user.role === 'Parent' && student.parent_user_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this resource.',
        });
      }
    }

    const studentGradeReport = await gradeModel.findGradesByStudent(studentId);

    return res.status(200).json({
      success: true,
      message: 'Student grade report and GPA retrieved successfully.',
      data: studentGradeReport,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/courses/:id/grades/audit or GET /api/v1/audit/logs
 * Retrieve immutable audit logs for grading operations.
 * Accessible to Admin and Faculty.
 */
const getGradingAuditLogs = async (req, res) => {
  try {
    const courseId = req.params.id ? parseInt(req.params.id, 10) : req.query.course_id;
    const studentId = req.query.student_id;
    const actorUserId = req.query.actor_user_id;

    const logs = await gradeModel.getAuditLogs({
      course_id: courseId,
      student_id: studentId,
      actor_user_id: actorUserId,
    });

    return res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully.',
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitCourseGrades,
  getCourseGrades,
  getStudentGrades,
  getGradingAuditLogs,
};
