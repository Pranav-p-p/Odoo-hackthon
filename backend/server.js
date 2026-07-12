// ============================================================================
// server.js — Express Application Entry Point
// ============================================================================
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');

<<<<<<< HEAD
const authRoutes        = require('./routes/auth.routes');
const departmentRoutes  = require('./routes/department.routes');
const categoryRoutes    = require('./routes/category.routes');
const userRoutes        = require('./routes/user.routes');
// Member 3 — Operations Module
const bookingRoutes     = require('./src/routes/booking.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');
=======
// ── Module 1 Routes (Member 1) ───────────────────────────────────────────────
const authRoutes       = require('./src/routes/auth.routes');
const departmentRoutes = require('./src/routes/department.routes');
const categoryRoutes   = require('./src/routes/category.routes');
const userRoutes       = require('./src/routes/user.routes');
>>>>>>> origin/main

// ── Module 4 Routes (Member 4) ───────────────────────────────────────────────
const dashboardRoutes    = require('./src/modules/dashboard/dashboard.routes');
const notificationRoutes = require('./src/modules/notification/notification.routes');
// const auditRoutes       = require('./src/modules/audit/audit.routes');             // TODO: uncomment when Step 3 is merged
// const reportsRoutes     = require('./src/modules/reports/reports.routes');          // TODO: uncomment when Step 4 is merged
// const activityLogRoutes = require('./src/modules/activity-log/activityLog.routes'); // TODO: uncomment when Step 5 is merged

const { errorHandler, notFoundHandler } = require('./src/middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// ── API Routes (Module 1 — Identity & Foundation) ─────────────────────────
=======
// ── API Routes — Module 1 (Member 1) ─────────────────────────────────────────
>>>>>>> origin/main
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/categories',  categoryRoutes);
app.use('/api/v1/users',       userRoutes);

<<<<<<< HEAD
// ── API Routes (Module 3 — Operations) ─────────────────────────────────────
app.use('/api/v1/bookings',             bookingRoutes);
app.use('/api/v1/maintenance-requests', maintenanceRoutes);
=======
// ── API Routes — Module 4 (Member 4) ─────────────────────────────────────────
app.use('/api/v1/dashboard',     dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/audits',       auditRoutes);        // TODO: uncomment when Step 3 is merged
// app.use('/api/v1/reports',      reportsRoutes);       // TODO: uncomment when Step 4 is merged
// app.use('/api/v1/activity-logs', activityLogRoutes);  // TODO: uncomment when Step 5 is merged
>>>>>>> origin/main

// ── Status Route ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy.' });
});

// ── Error Handlers ──────────────────────────────────────────────────────────
app.use(notFoundHandler); // 404 handler for unmatched routes
app.use(errorHandler);    // Global error handling middleware

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AssetFlow server running on http://localhost:${PORT}`);
  console.log(`🔌 Connected to database via Prisma Client`);
});
