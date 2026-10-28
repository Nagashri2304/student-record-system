/**
 * Grievance Resolution Workflow Controller
 * Requirement: SRS FR-10, FR-15; Architecture SAD Component C9 (Grievance Service)
 * Issue: #16 [SP-3] FR-10: Academic Discrepancy & Grade Grievance Resolution Workflow
 * Author: Kushitha K (@Kushitha30)
 */
const grievanceModel = require('../models/grievanceModel');
const courseModel = require('../models/courseModel');
const studentModel = require('../models/studentModel');

/**
 * POST /api/v1/grievances
 * Create a new academic or attendance grievance ticket in 'Open' state.
 * Accessible to Students (for their own record) and Admins.
 */
const createGrievance = async (req, res) => {
  try {
    let { student_id, course_id, grievance_type = 'grade', title, description } = req.body;

    // If student actor, automatically assign student_id based on logged in user
    if (req.user.role === 'Student') {
      const studentProfile = await studentModel.findByUserId(req.user.user_id);
      if (!studentProfile) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found for the authenticated user.',
        });
      }
      student_id = studentProfile.student_id;
    } else if (!student_id) {
      return res.status(400).json({
        success: false,
        message: 'student_id is required.',
      });
    }

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'course_id is required.',
      });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty grievance title is required.',
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty grievance description is required.',
      });
    }

    const course = await courseModel.findById(Number(course_id));
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Referenced course not found.',
      });
    }

    const normalizedType = grievance_type.toLowerCase();
    if (!grievanceModel.GRIEVANCE_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid grievance_type '${grievance_type}'. Must be one of: ${grievanceModel.GRIEVANCE_TYPES.join(', ')}.`,
      });
    }

    const newTicket = await grievanceModel.createGrievance({
      student_id: Number(student_id),
      course_id: Number(course_id),
      grievance_type: normalizedType,
      title: title.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Grievance ticket created successfully in Open state.',
      data: newTicket,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create grievance ticket.',
      error: err.message,
    });
  }
};

/**
 * PATCH /api/v1/grievances/:id
 * Update status and resolution notes of a grievance ticket.
 * Allows assigned instructor (or Admin) to update status to 'Resolved' (or 'In Review').
 */
const updateGrievance = async (req, res) => {
  try {
    const grievanceId = parseInt(req.params.id, 10);
    if (isNaN(grievanceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid grievance ID parameter.',
      });
    }

    const existingGrievance = await grievanceModel.findById(grievanceId);
    if (!existingGrievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance ticket not found.',
      });
    }

    // Role-specific check: Faculty must be assigned to the course of the grievance
    if (req.user.role === 'Faculty') {
      const course = await courseModel.findById(existingGrievance.course_id);
      if (!course || Number(course.faculty_user_id) !== Number(req.user.user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not the assigned instructor for this course grievance.',
        });
      }
    } else if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only the assigned faculty instructor or Administrator can resolve grievances.',
      });
    }

    const { status, resolution_notes } = req.body;

    if (!status && resolution_notes === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either status or resolution_notes to update.',
      });
    }

    if (status && !grievanceModel.GRIEVANCE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${grievanceModel.GRIEVANCE_STATUSES.join(', ')}.`,
      });
    }

    const updated = await grievanceModel.updateGrievanceStatus(grievanceId, {
      status,
      resolution_notes: resolution_notes !== undefined ? resolution_notes.trim() : undefined,
      resolved_by: req.user.user_id,
    });

    return res.status(200).json({
      success: true,
      message: `Grievance status updated successfully to '${updated.status}'.`,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update grievance ticket.',
      error: err.message,
    });
  }
};

/**
 * GET /api/v1/grievances/:id
 * Retrieve a specific grievance ticket including resolution notes.
 * Enforces zero-leak IDOR: Student can only view their own grievance.
 * Parent can view if linked to the student. Faculty can view if course instructor. Admin can view all.
 */
const getGrievanceById = async (req, res) => {
  try {
    const grievanceId = parseInt(req.params.id, 10);
    if (isNaN(grievanceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid grievance ID parameter.',
      });
    }

    const grievance = await grievanceModel.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance ticket not found.',
      });
    }

    // Access control verification
    if (req.user.role === 'Student') {
      const studentProfile = await studentModel.findByUserId(req.user.user_id);
      if (!studentProfile || Number(studentProfile.student_id) !== Number(grievance.student_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own grievance tickets.',
        });
      }
    } else if (req.user.role === 'Parent') {
      const student = await studentModel.findById(grievance.student_id);
      if (!student || Number(student.parent_user_id) !== Number(req.user.user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view grievances of unlinked students.',
        });
      }
    } else if (req.user.role === 'Faculty') {
      const course = await courseModel.findById(grievance.course_id);
      if (!course || Number(course.faculty_user_id) !== Number(req.user.user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not the assigned instructor for this course.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: grievance,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve grievance ticket.',
      error: err.message,
    });
  }
};

/**
 * GET /api/v1/grievances
 * List grievances filtered by user role and context.
 * Students get own grievances, Faculty get course grievances, Admin gets all.
 */
const listGrievances = async (req, res) => {
  try {
    if (req.user.role === 'Student') {
      const studentProfile = await studentModel.findByUserId(req.user.user_id);
      if (!studentProfile) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      const list = await grievanceModel.findByStudentId(studentProfile.student_id);
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    if (req.user.role === 'Faculty') {
      const courseId = req.query.course_id;
      if (courseId) {
        const list = await grievanceModel.findByCourseId(courseId);
        return res.status(200).json({ success: true, count: list.length, data: list });
      }
      // If no course specified, find all courses assigned to this faculty
      const allCourses = await courseModel.findAll();
      const assignedCourseIds = new Set(
        allCourses
          .filter((c) => Number(c.faculty_user_id) === Number(req.user.user_id))
          .map((c) => Number(c.course_id))
      );
      const allGrievances = await grievanceModel.findAll();
      const filtered = allGrievances.filter((g) => assignedCourseIds.has(Number(g.course_id)));
      return res.status(200).json({ success: true, count: filtered.length, data: filtered });
    }

    if (req.user.role === 'Admin') {
      const list = await grievanceModel.findAll();
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient privileges.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve grievances list.',
      error: err.message,
    });
  }
};

module.exports = {
  createGrievance,
  updateGrievance,
  getGrievanceById,
  listGrievances,
};
