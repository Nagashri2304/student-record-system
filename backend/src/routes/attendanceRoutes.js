/**
 * Attendance Alert & Aggregator Routes
 * Requirement: SRS FR-07 (Attendance Percentage Engine & Low Attendance Alert (<75%) System)
 * Test Plan: TC-04, TC-07
 * Author: Nagashree R Patil (@Nagashri2304)
 */
const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/roleAuth');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

let attendanceList = [
  { id: 1, course: "Database Management Systems", code: "CS301", attended: 28, total: 30, lastDate: "2026-10-24", faculty: "Dr. Kavya Rao" },
  { id: 2, course: "Software Engineering", code: "CS302", attended: 26, total: 28, lastDate: "2026-10-25", faculty: "Prof. Arjun Nair" },
  { id: 3, course: "Machine Learning", code: "CS303", attended: 24, total: 25, lastDate: "2026-10-26", faculty: "Dr. Kavya Rao" },
  { id: 4, course: "Design & Analysis of Algorithms", code: "CS304", attended: 29, total: 32, lastDate: "2026-10-26", faculty: "Prof. Arjun Nair" },
];

// FR-07: Real-time Low Attendance Alerts (<75%) for Faculty & Admin
router.get('/alerts', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.getAttendanceAlerts);

// FR-07: Automated Alert Dispatch (SMS/Email Warnings)
router.post('/alerts/dispatch', verifyToken, authorizeRoles('Admin', 'Faculty'), attendanceController.dispatchAttendanceAlerts);

router.get('/', (req, res) => {
  return res.status(200).json({ success: true, data: attendanceList, message: "Attendance retrieved successfully." });
});

router.post('/', (req, res) => {
  const { code, attended, total } = req.body;
  const match = attendanceList.find(a => a.code === code);
  if (match) {
    if (attended !== undefined) match.attended = Number(attended);
    if (total !== undefined) match.total = Number(total);
    return res.status(200).json({ success: true, data: match, message: "Attendance updated successfully." });
  }
  return res.status(200).json({ success: true, data: null, message: "Record updated." });
});

module.exports = router;
