const express = require("express");
const pool = require("../config/db");
const { successResponse } = require("../utils/response");

const router = express.Router();

const SAMPLE_STUDENTS = [
  { id: 1, rollNo: "SR001", name: "Aarav Sharma", dob: "2005-02-14", department: "Computer Science and Engineering", semester: 3, section: "A", program: "Bachelor of Technology", cgpa: "8.85", email: "aarav.sharma@edutrack.edu", phone: "+91 98765 43210", bloodGroup: "O+", guardianName: "Rajesh Sharma", guardianContact: "+91 90000 00001", address: "3rd Cross, Near High Tension Road, Vidhya Nagar, Bengaluru", isActive: true },
  { id: 2, rollNo: "SR002", name: "Diya Rao", dob: "2005-06-22", department: "Computer Science and Engineering", semester: 3, section: "A", program: "Bachelor of Technology", cgpa: "9.12", email: "diya.rao@edutrack.edu", phone: "+91 98765 43211", bloodGroup: "A+", guardianName: "Suresh Rao", guardianContact: "+91 90000 00002", address: "12th Main, Indiranagar, Bengaluru", isActive: true },
  { id: 3, rollNo: "SR003", name: "Ishaan Kumar", dob: "2004-11-09", department: "Computer Science and Engineering", semester: 3, section: "B", program: "Bachelor of Technology", cgpa: "8.40", email: "ishaan.kumar@edutrack.edu", phone: "+91 98765 43212", bloodGroup: "B+", guardianName: "Manoj Kumar", guardianContact: "+91 90000 00003", address: "45 Palm Meadows, Whitefield, Bengaluru", isActive: true },
  { id: 4, rollNo: "SR004", name: "Meera Nair", dob: "2005-01-17", department: "Computer Science and Engineering", semester: 3, section: "B", program: "Bachelor of Technology", cgpa: "9.30", email: "meera.nair@edutrack.edu", phone: "+91 98765 43213", bloodGroup: "AB+", guardianName: "Gopal Nair", guardianContact: "+91 90000 00004", address: "88 Koramangala 4th Block, Bengaluru", isActive: true },
  { id: 5, rollNo: "SR005", name: "Rohan Das", dob: "2005-08-30", department: "Computer Science and Engineering", semester: 3, section: "A", program: "Bachelor of Technology", cgpa: "7.95", email: "rohan.das@edutrack.edu", phone: "+91 98765 43214", bloodGroup: "O-", guardianName: "Amit Das", guardianContact: "+91 90000 00005", address: "102 HSR Layout Sector 2, Bengaluru", isActive: true },
];

router.get("/", async (req, res, next) => {
  try {
    try {
      const dbRes = await pool.query("SELECT * FROM students ORDER BY id ASC");
      if (dbRes.rows.length > 0) {
        return successResponse(res, dbRes.rows, "Students fetched successfully.");
      }
    } catch (e) {
      // fallback to mock
    }
    return successResponse(res, SAMPLE_STUDENTS, "Students fetched successfully.");
  } catch (err) {
    next(err);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    return successResponse(res, SAMPLE_STUDENTS[0], "Student profile fetched.");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
