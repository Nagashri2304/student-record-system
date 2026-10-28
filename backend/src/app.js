/**
 * Express Application Configuration
 * Authors: Monika PM (@Monikapm19), Kushitha K (@Kushitha30), Nidhi L (@nidhilokesh1), Nagashree R Patil (@Nagashri2304)
 */
const express = require('express');
const cors = require('cors');
const { sanitizeInput } = require('./middleware/sanitizeInput');
const { performanceBenchmark } = require('./middleware/performanceBenchmark');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const parentRoutes = require('./routes/parentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
// Global performance latency tracking & X-Response-Time header (NFR-01)
app.use(performanceBenchmark);
// Global input sanitization against XSS & script injection (SEC-02, TC-08)
app.use(sanitizeInput);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/grievances', grievanceRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/audit/logs', auditRoutes);
// Performance benchmarks & optimization (NFR-01)
app.use('/api/v1/performance', performanceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

module.exports = app;
