// ============================================================================
// server.js — Express Application Entry Point
// ============================================================================
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const departmentRoutes = require('./src/routes/department.routes');
const categoryRoutes = require('./src/routes/category.routes');
const userRoutes = require('./src/routes/user.routes');

const { errorHandler, notFoundHandler } = require('./src/middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  credentials: true,
};

// ── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// ── API Routes (Module 1) ──────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/users', userRoutes);

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
