// ============================================================================
// routes/department.routes.js — Department Management Endpoints
// ============================================================================

const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { createError } = require('../middleware/error.middleware');

const router = express.Router();

// GET /departments — Retrieve all departments with status filter
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status === 'ACTIVE' || status === 'INACTIVE') {
      where.status = status;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
});

// POST /departments — Create a new department (Admin only)
router.post('/', authenticate, adminOnly, validate(schemas.createDepartment), async (req, res, next) => {
  try {
    const { name, headId, parentDepartmentId, status } = req.body;

    // Check if unique constraint violated before trying to insert
    const duplicate = await prisma.department.findUnique({ where: { name } });
    if (duplicate) {
      throw createError(409, 'DUPLICATE_ENTRY', `A department named "${name}" already exists.`);
    }

    // Validate parentDepartmentId if provided
    if (parentDepartmentId) {
      const parentExist = await prisma.department.findUnique({ where: { id: parentDepartmentId } });
      if (!parentExist) {
        throw createError(400, 'INVALID_REFERENCE', 'Parent department does not exist.');
      }
    }

    // Validate headId if provided
    if (headId) {
      const user = await prisma.user.findUnique({ where: { id: headId } });
      if (!user) {
        throw createError(400, 'INVALID_REFERENCE', 'Assigned head user does not exist.');
      }
    }

    const newDept = await prisma.department.create({
      data: {
        name,
        headId: headId || null,
        parentDepartmentId: parentDepartmentId || null,
        status: status || 'ACTIVE',
      },
      include: {
        head: { select: { id: true, name: true } },
        parentDepartment: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: newDept,
      message: 'Department created successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /departments/:id — Update department details (Admin only)
router.patch('/:id', authenticate, adminOnly, validate(schemas.updateDepartment), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, headId, parentDepartmentId, status } = req.body;

    // Check if department exists
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      throw createError(404, 'NOT_FOUND', 'Department not found.');
    }

    // Cyclical reference check
    if (parentDepartmentId && parentDepartmentId === id) {
      throw createError(400, 'INVALID_REFERENCE', 'A department cannot be its own parent.');
    }

    // If name is updated, check unique
    if (name && name !== dept.name) {
      const duplicate = await prisma.department.findUnique({ where: { name } });
      if (duplicate) {
        throw createError(409, 'DUPLICATE_ENTRY', `A department named "${name}" already exists.`);
      }
    }

    const updatedDept = await prisma.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        headId: headId !== undefined ? headId : undefined,
        parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        head: { select: { id: true, name: true } },
        parentDepartment: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedDept,
      message: 'Department updated successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
