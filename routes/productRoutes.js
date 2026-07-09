const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Routes for "/api/products" (anime movies)
router
  .route('/')
  .get(productController.getProducts) // get all movies (with search filters)
  .post(productController.createProduct); // create a movie

// Routes for "/api/products/:id"
router
  .route('/:id')
  .get(productController.getProduct) // get details of 1 movie
  .put(productController.updateProduct) // update movie details
  .delete(productController.deleteProduct); // delete movie

module.exports = router;

