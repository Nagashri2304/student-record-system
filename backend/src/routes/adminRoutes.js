const express = require("express");

const router = express.Router();

router.get("/metrics", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin metrics fetched.",
    data: {
      totalStudents: 1420,
      totalFaculty: 85,
      activeCourses: 48,
      systemStatus: "Optimal",
      serverUptime: "99.98%",
      databaseHealth: "Connected",
      recentActivity: [
        { id: 1, action: "Attendance submitted for CS301", timestamp: "10 mins ago" },
        { id: 2, action: "New student enrolled in CSE semester 3", timestamp: "1 hour ago" },
        { id: 3, action: "Grades finalized for CS201", timestamp: "3 hours ago" },
      ]
    }
  });
});

module.exports = router;
