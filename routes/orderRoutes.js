const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Route: /api/orders
router
  .route('/')
  .get(orderController.getOrders)
  .post(orderController.checkout);

// Route: /api/orders/:id
router.route('/:id').get(orderController.getOrder);

// Route: /api/orders/:id/status
router.route('/:id/status').put(orderController.updateOrderStatus);

module.exports = router;
