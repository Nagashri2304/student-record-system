const express = require("express");

const router = express.Router();

let gradesList = [
  { id: 1, course: "Engineering Mathematics & Calculus", code: "MA101", marks: 88, grade: "A", credits: 4, semester: 1, faculty: "Dr. Kavya Rao" },
  { id: 2, course: "Programming & Problem Solving in C", code: "CS101", marks: 91, grade: "S", credits: 4, semester: 1, faculty: "Prof. Arjun Nair" },
  { id: 3, course: "Data Structures & Algorithms", code: "CS201", marks: 94, grade: "S", credits: 4, semester: 2, faculty: "Dr. Kavya Rao" },
  { id: 4, course: "Computer Organization & Architecture", code: "CS202", marks: 79, grade: "B+", credits: 4, semester: 2, faculty: "Prof. Arjun Nair" },
  { id: 5, course: "Database Management Systems", code: "CS301", marks: 91, grade: "A+", credits: 4, semester: 3, faculty: "Dr. Kavya Rao" },
  { id: 6, course: "Software Engineering", code: "CS302", marks: 84, grade: "A", credits: 4, semester: 3, faculty: "Prof. Arjun Nair" },
  { id: 7, course: "Machine Learning", code: "CS303", marks: 88, grade: "A", credits: 4, semester: 3, faculty: "Dr. Kavya Rao" },
  { id: 8, course: "Design & Analysis of Algorithms", code: "CS401", marks: 94, grade: "S", credits: 4, semester: 4, faculty: "Dr. Kavya Rao" },
  { id: 9, course: "Software Engineering & Object-Oriented Design", code: "CS402", marks: 89, grade: "A", credits: 4, semester: 4, faculty: "Prof. Arjun Nair" },
  { id: 10, course: "Computer Networks & Distributed Systems", code: "CS403", marks: 85, grade: "A", credits: 3, semester: 4, faculty: "Dr. Kavya Rao" },
];

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    data: gradesList,
    message: "Grades retrieved successfully."
  });
});

router.post("/", (req, res) => {
  const { course, code, marks, grade, semester, faculty } = req.body;
  const numMarks = Number(marks) || 85;
  let letter = grade;
  if (!letter) {
    if (numMarks >= 90) letter = "S";
    else if (numMarks >= 80) letter = "A";
    else if (numMarks >= 70) letter = "B";
    else if (numMarks >= 60) letter = "C";
    else if (numMarks >= 50) letter = "D";
    else letter = "F";
  }

  // Check if course already exists in the list to update, else append
  const existing = gradesList.find(g => g.code === code);
  if (existing) {
    existing.marks = numMarks;
    existing.grade = letter;
    if (course) existing.course = course;
    if (faculty) existing.faculty = faculty;
    return res.status(200).json({
      success: true,
      data: existing,
      message: `Marks updated for ${code}.`
    });
  }

  const newGrade = {
    id: gradesList.length + 1,
    course: course || (code === "CS301" ? "Database Management Systems" : code === "CS302" ? "Software Engineering" : "Core Engineering Subject"),
    code: code || "CS301",
    marks: numMarks,
    grade: letter,
    credits: 4,
    semester: Number(semester) || 3,
    faculty: faculty || "Dr. Kavya Rao",
  };
  gradesList.push(newGrade);
  return res.status(201).json({
    success: true,
    data: newGrade,
    message: "Grade entered successfully."
  });
});

router.get("/report-card", (req, res, next) => {
  const reportCardController = require("../controllers/reportCardController");
  req.params = { id: req.query.student_id || 1 };
  return reportCardController.generateReportCard(req, res, next);
});

module.exports = router;
