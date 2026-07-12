// ============================================================================
// routes/category.routes.js — Asset Category Endpoints
// ============================================================================

const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { createError } = require('../middleware/error.middleware');

const router = express.Router();

// GET /categories — List all categories
router.get('/', authenticate, async (req, res, next) => {
  try {
    const categories = await prisma.assetCategory.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

// POST /categories — Create an asset category (Admin only)
router.post('/', authenticate, adminOnly, validate(schemas.createCategory), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const duplicate = await prisma.assetCategory.findUnique({ where: { name } });
    if (duplicate) {
      throw createError(409, 'DUPLICATE_ENTRY', `An asset category named "${name}" already exists.`);
    }

    const category = await prisma.assetCategory.create({
      data: { name, description },
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /categories/:id — Update an asset category (Admin only)
router.patch('/:id', authenticate, adminOnly, validate(schemas.createCategory), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const categoryExist = await prisma.assetCategory.findUnique({ where: { id } });
    if (!categoryExist) {
      throw createError(404, 'NOT_FOUND', 'Asset category not found.');
    }

    if (name && name !== categoryExist.name) {
      const duplicate = await prisma.assetCategory.findUnique({ where: { name } });
      if (duplicate) {
        throw createError(409, 'DUPLICATE_ENTRY', `An asset category named "${name}" already exists.`);
      }
    }

    const updatedCategory = await prisma.assetCategory.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
