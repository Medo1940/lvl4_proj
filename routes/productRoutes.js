const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Route: /api/products
router
  .route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);

// Route: /api/products/:id
router
  .route('/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
