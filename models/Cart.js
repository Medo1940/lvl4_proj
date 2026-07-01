const mongoose = require('mongoose');

// Define the blueprint for individual items in the cart
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'A cart item must reference a product.']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required.'],
    min: [1, 'Quantity cannot be less than 1. Please add at least 1 item.'],
    default: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number (integer).'
    }
  }
});
// {"userId": "default_user", 
//   "items": [{"product": "64b4c6c8e4f6d0f9d1e4e8e5", "quantity": 1},
//      {"product": "64b4c6c8e4f6d0f9d1e4e8e5", "quantity": 1}],
//       "totalPrice": 0}
// Define the blueprint for the entire Cart
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user', // Since we don't have login, we use a single default cart
      required: true,
      unique: true // One user can only have one active cart
    },
    items: [cartItemSchema], // Array of products added to the cart
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true // Tracks when the cart was created and updated
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
