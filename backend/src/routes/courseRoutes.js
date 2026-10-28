const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

const courses = [
  { id: 1, code: "CS301", name: "Database Management Systems", semester: 3, credits: 4, faculty: "Dr. Kavya Rao", enrolledCount: 64, room: "LH-201" },
  { id: 2, code: "CS302", name: "Software Engineering", semester: 3, credits: 4, faculty: "Prof. Arjun Nair", enrolledCount: 62, room: "LH-202" },
  { id: 3, code: "CS303", name: "Machine Learning", semester: 3, credits: 4, faculty: "Dr. Kavya Rao", enrolledCount: 58, room: "Lab-3" },
  { id: 4, code: "CS304", name: "Design & Analysis of Algorithms", semester: 3, credits: 4, faculty: "Prof. Arjun Nair", enrolledCount: 65, room: "LH-204" },
];

router.get("/", (req, res) => {
  return successResponse(res, courses, "Courses fetched successfully.");
});

module.exports = router;
