const mongoose = require('mongoose');

// This schema saves the items purchased in the order
// We save the movie name and price at checkout time directly,
// because if prices change later, our order history price shouldn't change
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // references the movie
    required: [true, 'Order item must link to a movie.']
  },
  name: {
    type: String,
    required: [true, 'Order item needs the movie name.']
  },
  price: {
    type: Number,
    required: [true, 'Order item needs the movie price.'],
    min: [0, 'Price cannot be negative.']
  },
  quantity: {
    type: Number,
    required: [true, 'Order item needs a quantity.'],
    min: [1, 'Quantity must be at least 1.']
  }
});

// This schema defines the main Order details
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      required: true
    },
    items: [orderItemSchema], // list of purchased movies
    totalPrice: {
      type: Number,
      required: [true, 'An order needs a total price.']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Status must be: pending, processing, shipped, delivered, or cancelled.'
      },
      default: 'pending'
    },
    shippingAddress: {
      type: String,
      required: [true, 'Please write down an address (or email/details for tickets).'],
      trim: true
    }
  },
  {
    // tracks when order was created and updated
    timestamps: true
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

