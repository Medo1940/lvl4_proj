const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// HELPER: Recalculate the cart's total price dynamically
const calculateCartTotal = async (cart) => {
  let total = 0;
  // Ensure the product details are populated so we can access their price fields
  await cart.populate('items.product');
  
  cart.items.forEach((item) => {
    if (item.product) {
      total += item.product.price * item.quantity;
    }
  });

  // Round the total price to 2 decimal places (e.g. 59.99 instead of 59.98999999)
  cart.totalPrice = Math.round(total * 100) / 100;
};

// 1. VIEW CART
// Route: GET /api/cart
exports.getCart = asyncHandler(async (req, res, next) => {
  // Find the cart for default_user, or create one if it doesn't exist yet
  let cart = await Cart.findOne({ userId: 'default_user' }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ userId: 'default_user', items: [], totalPrice: 0 });
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});

// 2. ADD ITEM TO CART
// Route: POST /api/cart
// Request Body: { productId, quantity }
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const quantityToAdd = Number(quantity) || 1;

  if (quantityToAdd <= 0) {
    return next(new AppError('Quantity must be at least 1.', 400));
  }

  // 2.1 Find the product to verify it exists and check its stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  // 2.2 Get or create the cart
  let cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    cart = await Cart.create({ userId: 'default_user', items: [], totalPrice: 0 });
  }

  // 2.3 Check if product is already in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Product exists in cart - check stock for total new quantity
    const newQuantity = cart.items[itemIndex].quantity + quantityToAdd;
    if (newQuantity > product.stock) {
      return next(
        new AppError(
          `Cannot add ${quantityToAdd} more of this item. You already have ${cart.items[itemIndex].quantity} in cart, and total stock is ${product.stock}.`,
          400
        )
      );
    }
    // Update quantity
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Product does not exist in cart - check stock first
    if (quantityToAdd > product.stock) {
      return next(
        new AppError(
          `Cannot add ${quantityToAdd} item(s) to cart. Only ${product.stock} left in stock.`,
          400
        )
      );
    }
    // Add new item
    cart.items.push({ product: productId, quantity: quantityToAdd });
  }

  // 2.4 Recalculate total price and save
  await calculateCartTotal(cart);
  await cart.save();

  // Re-populate and return the updated cart
  await cart.populate('items.product');

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully.',
    data: {
      cart
    }
  });
});

// 3. UPDATE CART ITEM QUANTITY
// Route: PUT /api/cart/:productId
// Request Body: { quantity }
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const newQuantity = Number(req.body.quantity);

  if (!newQuantity || newQuantity <= 0) {
    return next(new AppError('Quantity must be at least 1. To remove an item, use the delete method.', 400));
  }

  // 3.1 Verify product exists and check its stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  if (newQuantity > product.stock) {
    return next(
      new AppError(
        `Cannot update quantity to ${newQuantity}. Only ${product.stock} items left in stock.`,
        400
      )
    );
  }

  // 3.2 Find the cart
  const cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  // 3.3 Find the item in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new AppError('Product not found in your cart.', 404));
  }

  // 3.4 Update item quantity and total price
  cart.items[itemIndex].quantity = newQuantity;
  await calculateCartTotal(cart);
  await cart.save();

  // Populate and send back
  await cart.populate('items.product');

  res.status(200).json({
    status: 'success',
    message: 'Cart item updated successfully.',
    data: {
      cart
    }
  });
});

// 4. REMOVE ITEM FROM CART
// Route: DELETE /api/cart/:productId
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: 'default_user' });
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  // Check if item exists in the cart
  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    return next(new AppError('Product not found in your cart.', 404));
  }

  // Filter out the item
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  // Recalculate and save
  await calculateCartTotal(cart);
  await cart.save();

  await cart.populate('items.product');

  res.status(200).json({
    status: 'success',
    message: 'Product removed from cart successfully.',
    data: {
      cart
    }
  });
});

// 5. CLEAR CART
// Route: DELETE /api/cart
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: 'default_user' });
  
  if (!cart) {
    return next(new AppError('No cart found for this user.', 404));
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully.',
    data: {
      cart
    }
  });
});
