const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Routes for "/api/categories"
router
  .route('/')
  .get(categoryController.getCategories) // get all categories
  .post(categoryController.createCategory); // add a category

// Routes for "/api/categories/:id" (requires category id parameter)
router
  .route('/:id')
  .get(categoryController.getCategory) // get one category
  .put(categoryController.updateCategory) // update category details
  .delete(categoryController.deleteCategory); // delete category

module.exports = router;

