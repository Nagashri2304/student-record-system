/**
 * Daily Attendance & Session Validation Controller
 * Requirement: SRS FR-04, NFR-08; Test Plan TC-04
 * Issue: #1 [SP-5] FR-04: Daily Attendance Marking & Session Validation Engine
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const attendanceModel = require('../models/attendanceModel');
const courseModel = require('../models/courseModel');
const studentModel = require('../models/studentModel');

/**
 * POST /api/v1/courses/:id/attendance
 * Batch attendance submission for a course lecture session.
 * Accessible to Faculty and Admin.
 */
const markAttendance = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const { session_date, period, topic, records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance submission requires a non-empty records array.',
      });
    }

    const session = await attendanceModel.createSession({
      course_id: courseId,
      faculty_user_id: req.user.user_id,
      session_date,
      period,
      topic,
      records,
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: session,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.message.includes('Invalid') ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/courses/:id/attendance
 * Retrieve all attendance sessions recorded for a course.
 */
const getCourseAttendance = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID.' });
    }

    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const sessions = await attendanceModel.findSessionsByCourse(courseId);

    return res.status(200).json({
      success: true,
      message: 'Attendance sessions retrieved successfully.',
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/courses/:id/attendance/:sessionId
 * Retrieve a single attendance session by session_id.
 */
const getAttendanceSession = async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);
    const session = await attendanceModel.findSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance session retrieved successfully.',
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/v1/courses/:id/attendance/:sessionId
 * Modify an existing attendance session.
 * Enforces 24-hour edit limit on session records.
 */
const updateAttendanceSession = async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);
    const updates = req.body;

    const updatedSession = await attendanceModel.updateSession(
      sessionId,
      updates,
      req.user.user_id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance session updated successfully.',
      data: updatedSession,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.code === 'EDIT_WINDOW_EXPIRED' ? 403 : 400);
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      code: error.code || 'UPDATE_FAILED',
    });
  }
};

/**
 * GET /api/v1/students/:id/attendance
 * Retrieve aggregated attendance summary for a student.
 * Protected by role authorization & IDOR object guards.
 */
const getStudentAttendance = async (req, res) => {
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

      // Zero-Trust IDOR Protection: Student can only view own, Parent can only view linked child
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

    const summary = await attendanceModel.getStudentAttendanceSummary(studentId);

    return res.status(200).json({
      success: true,
      message: 'Student attendance summary retrieved successfully.',
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  markAttendance,
  getCourseAttendance,
  getAttendanceSession,
  updateAttendanceSession,
  getStudentAttendance,
};
