const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// HELPER FUNCTION: Recalculate total price of cart
const calculateCartTotal = async (cart) => {
  let total = 0;
  // populate product to get their prices
  await cart.populate('items.product');
  
  cart.items.forEach((item) => {
    if (item.product) {
      total = total + (item.product.price * item.quantity);
    }
  });

  // round to 2 decimal places so it looks nice
  cart.totalPrice = Math.round(total * 100) / 100;
};

// 1. GET CART
// Route: GET /api/cart
exports.getCart = asyncHandler(async (req, res, next) => {
  console.log("Fetching cart for user...");
  
  // Find cart for default_user, create it if it doesn't exist
  let cart = await Cart.findOne({ userId: 'default_user' }).populate('items.product');

  if (!cart) {
    console.log("No cart found, creating a new empty cart.");
    cart = await Cart.create({ userId: 'default_user', items: [], totalPrice: 0 });
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart: cart
    }
  });
});

// 2. ADD MOVIE TO CART
// Route: POST /api/cart
// Request Body: { productId, quantity }
exports.addToCart = asyncHandler(async (req, res, next) => {
  const productId = req.body.productId;
  const quantity = req.body.quantity;
  
  const quantityToAdd = Number(quantity) || 1;

  console.log("Adding " + quantityToAdd + " tickets of movie " + productId + " to cart.");

  if (quantityToAdd <= 0) {
    return next(new AppError('Quantity must be at least 1.', 400));
  }

  // Find the movie first
  const product = await Product.findById(productId);
  if (!product) {
    console.log("Movie not found.");
    return next(new AppError('No product found with that ID.', 404));
  }

  // Get user's cart
  let cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    cart = await Cart.create({ userId: 'default_user', items: [], totalPrice: 0 });
  }

  // Check if this movie is already in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() == productId
  );

  if (itemIndex > -1) {
    // If it exists in cart, check stock limits
    const newQuantity = cart.items[itemIndex].quantity + quantityToAdd;
    if (newQuantity > product.stock) {
      console.log("Not enough tickets in stock.");
      return next(
        new AppError(
          'Cannot add more tickets. You already have ' + cart.items[itemIndex].quantity + ' in cart, and total available seats are ' + product.stock + '.',
          400
        )
      );
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // If not in cart, check stock first
    if (quantityToAdd > product.stock) {
      console.log("Requested quantity exceeds stock.");
      return next(
        new AppError(
          'Cannot add ' + quantityToAdd + ' tickets. Only ' + product.stock + ' left in stock.',
          400
        )
      );
    }
    cart.items.push({ product: productId, quantity: quantityToAdd });
  }

  // recalculate total price and save
  await calculateCartTotal(cart);
  await cart.save();

  // Populate products to show details in the response
  await cart.populate('items.product');

  console.log("Tickets added to cart successfully!");

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully.',
    data: {
      cart: cart
    }
  });
});

// 3. UPDATE QUANTITY OF CART ITEM
// Route: PUT /api/cart/:productId
// Request Body: { quantity }
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  const newQuantity = Number(req.body.quantity);

  console.log("Updating tickets quantity for movie: " + productId + " to " + newQuantity);

  if (!newQuantity || newQuantity <= 0) {
    return next(new AppError('Quantity must be at least 1. To remove an item, use the delete method.', 400));
  }

  // Check if movie exists and has enough stock
  const product = await Product.findById(productId);
  if (!product) {
    console.log("Movie not found.");
    return next(new AppError('No product found with that ID.', 404));
  }

  if (newQuantity > product.stock) {
    console.log("Insufficient stock for update.");
    return next(
      new AppError(
        'Cannot update quantity to ' + newQuantity + '. Only ' + product.stock + ' seats left.',
        400
      )
    );
  }

  // Find the cart
  const cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  // Find the movie inside items array
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() == productId
  );

  if (itemIndex == -1) {
    return next(new AppError('Product not found in your cart.', 404));
  }

  // Update item quantity
  cart.items[itemIndex].quantity = newQuantity;
  await calculateCartTotal(cart);
  await cart.save();

  await cart.populate('items.product');

  console.log("Cart item updated successfully.");

  res.status(200).json({
    status: 'success',
    message: 'Cart item updated successfully.',
    data: {
      cart: cart
    }
  });
});

// 4. REMOVE ITEM FROM CART
// Route: DELETE /api/cart/:productId
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  console.log("Removing movie " + productId + " from cart...");

  const cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  // Check if item is in the cart
  const itemExists = cart.items.some(
    (item) => item.product.toString() == productId
  );

  if (!itemExists) {
    console.log("Movie is not in user's cart.");
    return next(new AppError('Product not found in your cart.', 404));
  }

  // filter out the product
  cart.items = cart.items.filter((item) => item.product.toString() != productId);

  // Recalculate total price and save
  await calculateCartTotal(cart);
  await cart.save();

  await cart.populate('items.product');

  console.log("Movie removed from cart.");

  res.status(200).json({
    status: 'success',
    message: 'Product removed from cart successfully.',
    data: {
      cart: cart
    }
  });
});

// 5. CLEAR ENTIRE CART
// Route: DELETE /api/cart
exports.clearCart = asyncHandler(async (req, res, next) => {
  console.log("Clearing all items from user's cart...");
  
  const cart = await Cart.findOne({ userId: 'default_user' });
  
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  console.log("Cart cleared successfully.");

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully.',
    data: {
      cart: cart
    }
  });
});

