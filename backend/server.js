// ============================================================================
// server.js — Express Application Entry Point
// ============================================================================
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');

const authRoutes        = require('./routes/auth.routes');
const departmentRoutes  = require('./routes/department.routes');
const categoryRoutes    = require('./routes/category.routes');
const userRoutes        = require('./routes/user.routes');
// Member 3 — Operations Module
const bookingRoutes     = require('./src/routes/booking.routes');
const maintenanceRoutes = require('./src/routes/maintenance.routes');

const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes (Module 1 — Identity & Foundation) ─────────────────────────
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/categories',  categoryRoutes);
app.use('/api/v1/users',       userRoutes);

// ── API Routes (Module 3 — Operations) ─────────────────────────────────────
app.use('/api/v1/bookings',             bookingRoutes);
app.use('/api/v1/maintenance-requests', maintenanceRoutes);

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
