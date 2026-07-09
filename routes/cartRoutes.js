const express = require('express');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Routes for "/api/cart" (user's active cart)
router
  .route('/')
  .get(cartController.getCart) // get cart items
  .post(cartController.addToCart) // add movie to cart
  .delete(cartController.clearCart); // clear the cart

// Routes for "/api/cart/:productId" (manipulate item in cart)
router
  .route('/:productId')
  .put(cartController.updateCartItem) // update quantity
  .delete(cartController.removeFromCart); // remove movie from cart

module.exports = router;

