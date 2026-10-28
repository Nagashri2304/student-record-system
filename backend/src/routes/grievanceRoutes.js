const express = require("express");
const { successResponse } = require("../utils/response");

const router = express.Router();

let grievances = [
  { id: 1, student: "Aarav Sharma", category: "Grading Discrepancy", description: "Requesting review of Quiz 2 marks in CS301.", status: "In Review", raisedAt: "2026-10-22" },
  { id: 2, student: "Diya Rao", category: "Attendance Correction", description: "Attended lab on Oct 18 but marked absent due to scanner error.", status: "Resolved", raisedAt: "2026-10-19" },
];

router.get("/", (req, res) => {
  return successResponse(res, grievances, "Grievances retrieved.");
});

router.post("/", (req, res) => {
  const { category, description } = req.body;
  const newG = {
    id: grievances.length + 1,
    student: "Aarav Sharma",
    category: category || "General",
    description: description || "No description provided",
    status: "Open",
    raisedAt: new Date().toISOString().split("T")[0],
  };
  grievances.unshift(newG);
  return successResponse(res, newG, "Grievance submitted successfully.", 201);
});

module.exports = router;
