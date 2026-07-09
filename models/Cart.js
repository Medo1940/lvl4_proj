const mongoose = require('mongoose');

// This schema defines individual items in the user's movie checkout cart
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // references the movie (Product)
    required: [true, 'Cart item must point to a movie.']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is needed!'],
    min: [1, 'You must add at least 1 ticket/movie copy.'],
    default: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number (integer).'
    }
  }
});

// This schema defines the main Cart model
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user', // since we don't have login, everybody shares this default cart
      required: true,
      unique: true // one cart per user
    },
    items: [cartItemSchema], // list of items
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    // tracks when cart was created or updated
    timestamps: true
  }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

