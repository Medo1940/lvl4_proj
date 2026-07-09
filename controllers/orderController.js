const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// 1. CHECKOUT (creates order from user cart)
// Route: POST /api/orders
// Request Body: { shippingAddress }
exports.checkout = asyncHandler(async (req, res, next) => {
  console.log("Starting checkout process...");
  
  const shippingAddress = req.body.shippingAddress;

  if (!shippingAddress) {
    console.log("No address provided for checkout.");
    return next(new AppError('Please provide a shipping address for the order.', 400));
  }

  // Get user's cart and populate the movie details
  const cart = await Cart.findOne({ userId: 'default_user' }).populate('items.product');

  // Check if cart is empty
  if (!cart || cart.items.length == 0) {
    console.log("Cannot checkout, cart is empty!");
    return next(new AppError('Your cart is empty. Please add items to your cart before placing an order.', 400));
  }

  const orderItems = [];

  // Verify stock of tickets for every movie in cart
  for (const item of cart.items) {
    const movie = item.product;
    if (!movie) {
      return next(new AppError('One of the movies in your cart no longer exists.', 400));
    }

    // Check if enough tickets are in stock
    if (movie.stock < item.quantity) {
      console.log("Insufficient tickets/stock for movie: " + movie.name);
      return next(
        new AppError(
          'Insufficient stock for "' + movie.name + '". Only ' + movie.stock + ' tickets left, you wanted ' + item.quantity + '.',
          400
        )
      );
    }

    // Push snapshot details to order history list
    orderItems.push({
      product: movie._id,
      name: movie.name,
      price: movie.price, // save price at checkout
      quantity: item.quantity
    });
  }

  // Decrement movie ticket stock in the database
  for (const item of cart.items) {
    const movieDoc = await Product.findById(item.product._id);
    movieDoc.stock = movieDoc.stock - item.quantity;
    await movieDoc.save({ validateBeforeSave: true });
  }

  // Save the order to db
  const order = await Order.create({
    userId: 'default_user',
    items: orderItems,
    totalPrice: cart.totalPrice,
    shippingAddress: shippingAddress
  });

  // Empty the cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  console.log("Checkout complete! Order created with ID: " + order._id);

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully! Thank you for your purchase.',
    data: {
      order: order
    }
  });
});

// 2. GET ALL ORDERS LIST
// Route: GET /api/orders
exports.getOrders = asyncHandler(async (req, res, next) => {
  console.log("Getting all orders from database...");
  
  const orders = await Order.find().sort({ createdAt: -1 }); // sort newest first

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders: orders
    }
  });
});

// 3. GET SINGLE ORDER DETAILS BY ID
// Route: GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  console.log("Getting details for order ID: " + orderId);

  const order = await Order.findById(orderId);

  if (!order) {
    console.log("Order not found.");
    return next(new AppError('No order found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order: order
    }
  });
});

// 4. UPDATE ORDER STATUS (e.g. pending -> processing -> shipped)
// Route: PUT /api/orders/:id/status
// Request Body: { status }
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const status = req.body.status;

  console.log("Updating status of order: " + orderId + " to: " + status);

  if (!status) {
    return next(new AppError('Please provide the new status.', 400));
  }

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(
      new AppError(
        'Invalid status. Status must be one of: ' + allowedStatuses.join(', '),
        400
      )
    );
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: status },
    {
      new: true,
      runValidators: true
    }
  );

  if (!order) {
    console.log("Order not found, cannot update.");
    return next(new AppError('No order found with that ID.', 404));
  }

  console.log("Order status updated successfully.");

  res.status(200).json({
    status: 'success',
    message: 'Order status updated to ' + status + ' successfully.',
    data: {
      order: order
    }
  });
});

