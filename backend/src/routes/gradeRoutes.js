const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

let gradesList = [
  { id: 1, course: "Database Management Systems", code: "CS301", marks: 91, grade: "A+", credits: 4, semester: 3, faculty: "Dr. Kavya Rao" },
  { id: 2, course: "Software Engineering", code: "CS302", marks: 84, grade: "A", credits: 4, semester: 3, faculty: "Prof. Arjun Nair" },
  { id: 3, course: "Machine Learning", code: "CS303", marks: 88, grade: "A", credits: 4, semester: 3, faculty: "Dr. Kavya Rao" },
  { id: 4, course: "Data Structures & Algorithms", code: "CS201", marks: 94, grade: "S", credits: 4, semester: 2, faculty: "Dr. Kavya Rao" },
  { id: 5, course: "Computer Networks", code: "CS202", marks: 79, grade: "B+", credits: 3, semester: 2, faculty: "Prof. Arjun Nair" },
];

router.get("/", (req, res) => {
  return successResponse(res, gradesList, "Grades retrieved successfully.");
});

router.post("/", (req, res) => {
  const { course, code, marks, grade } = req.body;
  const newGrade = {
    id: gradesList.length + 1,
    course: course || "New Course",
    code: code || "CS399",
    marks: Number(marks) || 85,
    grade: grade || "A",
    credits: 3,
    semester: 3,
    faculty: "Faculty Member",
  };
  gradesList.push(newGrade);
  return successResponse(res, newGrade, "Grade entered successfully.", 201);
});

module.exports = router;
