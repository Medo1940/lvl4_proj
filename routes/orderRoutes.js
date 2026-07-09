const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Routes for "/api/orders"
router
  .route('/')
  .get(orderController.getOrders) // get all order history
  .post(orderController.checkout); // checkout cart to place order

// Routes for "/api/orders/:id"
router.route('/:id').get(orderController.getOrder); // get one order detail

// Routes for "/api/orders/:id/status" (to change order status)
router.route('/:id/status').put(orderController.updateOrderStatus);

module.exports = router;

