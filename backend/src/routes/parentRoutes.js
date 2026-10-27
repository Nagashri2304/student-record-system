const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

router.get("/overview", (req, res) => {
  return successResponse(res, {
    childName: "Aarav Sharma",
    rollNo: "SR001",
    department: "Computer Science and Engineering",
    semester: 3,
    cgpa: "8.85",
    overallAttendance: "92%",
    upcomingExams: [
      { course: "Database Management Systems", date: "2026-11-12", type: "Mid-Term II" },
      { course: "Software Engineering", date: "2026-11-15", type: "Mid-Term II" },
    ],
  }, "Parent overview fetched.");
});

module.exports = router;
