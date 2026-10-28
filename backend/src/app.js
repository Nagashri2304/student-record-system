/**
 * Express Application Configuration
 * Authors: Monika PM (@Monikapm19), Kushitha K (@Kushitha30), Nagashree R Patil (@Nagashri2304)
 */
const express = require('express');
const cors = require('cors');
const { sanitizeInput } = require('./middleware/sanitizeInput');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
// Global input sanitization against XSS & script injection (SEC-02, TC-08)
app.use(sanitizeInput);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/grievances', grievanceRoutes);
// Immutable Security Audit Trail routes (SEC-03, TC-09)
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/audit/logs', auditRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

module.exports = app;
