const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Route: /api/cart
router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

// Route: /api/cart/:productId
router
  .route('/:productId')
  .put(cartController.updateCartItem)
  .delete(cartController.removeFromCart);

module.exports = router;
