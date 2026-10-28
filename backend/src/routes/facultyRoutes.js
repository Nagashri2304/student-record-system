const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

const facultyList = [
  { id: 1, name: "Dr. Kavya Rao", department: "Computer Science and Engineering", designation: "Associate Professor", email: "kavya.rao@edutrack.edu", courses: ["CS301", "CS303"], cabin: "Block B - 302" },
  { id: 2, name: "Prof. Arjun Nair", department: "Computer Science and Engineering", designation: "Assistant Professor", email: "arjun.nair@edutrack.edu", courses: ["CS302", "CS304"], cabin: "Block B - 215" },
];

router.get("/", (req, res) => {
  return successResponse(res, facultyList, "Faculty list retrieved successfully.");
});

module.exports = router;
