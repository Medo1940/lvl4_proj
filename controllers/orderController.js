const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// 1. CHECKOUT (Create Order from Cart)
// Route: POST /api/orders
// Request Body: { shippingAddress }
exports.checkout = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return next(new AppError('Please provide a shipping address for the order.', 400));
  }

  // 1.1 Fetch the active cart for our default_user and populate product details
  const cart = await Cart.findOne({ userId: 'default_user' }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return next(
      new AppError('Your cart is empty. Please add items to your cart before placing an order.', 400)
    );
  }

  const orderItems = [];

  // 1.2 Verify stock for every item before making any changes
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      return next(new AppError('One of the products in your cart no longer exists.', 400));
    }

    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for "${product.name}". Only ${product.stock} items are left in stock, but you requested ${item.quantity}. Please update your cart.`,
          400
        )
      );
    }

    // 1.3 Add to order snapshot
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price, // Snapshot current price
      quantity: item.quantity
    });
  }

  // 1.4 Decrement stock for each product in the database
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    product.stock -= item.quantity;
    await product.save({ validateBeforeSave: true });
  }

  // 1.5 Create the order in the database
  const order = await Order.create({
    userId: 'default_user',
    items: orderItems,
    totalPrice: cart.totalPrice,
    shippingAddress
  });

  // 1.6 Clear the shopping cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully! Thank you for your purchase.',
    data: {
      order
    }
  });
});

// 2. GET ALL ORDERS
// Route: GET /api/orders
exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().sort({ createdAt: -1 }); // Newest orders first

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// 3. GET SINGLE ORDER BY ID
// Route: GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('No order found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// 4. UPDATE ORDER STATUS (e.g. pending -> shipped)
// Route: PUT /api/orders/:id/status
// Request Body: { status }
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Please provide the new status.', 400));
  }

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(
      new AppError(
        `Invalid status. Status must be one of: ${allowedStatuses.join(', ')}`,
        400
      )
    );
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!order) {
    return next(new AppError('No order found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `Order status updated to ${status} successfully.`,
    data: {
      order
    }
  });
});
