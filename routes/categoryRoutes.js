const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Route: /api/categories
router
  .route('/')
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

// Route: /api/categories/:id
router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
