const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

let attendanceList = [
  { id: 1, course: "Database Management Systems", code: "CS301", attended: 28, total: 30, lastDate: "2026-10-24", faculty: "Dr. Kavya Rao" },
  { id: 2, course: "Software Engineering", code: "CS302", attended: 26, total: 28, lastDate: "2026-10-25", faculty: "Prof. Arjun Nair" },
  { id: 3, course: "Machine Learning", code: "CS303", attended: 24, total: 25, lastDate: "2026-10-26", faculty: "Dr. Kavya Rao" },
  { id: 4, course: "Design & Analysis of Algorithms", code: "CS304", attended: 29, total: 32, lastDate: "2026-10-26", faculty: "Prof. Arjun Nair" },
];

router.get("/", (req, res) => {
  return successResponse(res, attendanceList, "Attendance retrieved successfully.");
});

router.post("/", (req, res) => {
  const { code, attended, total } = req.body;
  const match = attendanceList.find(a => a.code === code);
  if (match) {
    if (attended !== undefined) match.attended = Number(attended);
    if (total !== undefined) match.total = Number(total);
    return successResponse(res, match, "Attendance updated successfully.");
  }
  return successResponse(res, null, "Record updated.");
});

module.exports = router;
