const mongoose = require('mongoose');

// Define details of products purchased in this order.
// We save the product name and price directly here as a snapshot, 
// because if a product's price changes later, the historical order price should stay the same.
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Order item must link to a product.']
  },
  name: {
    type: String,
    required: [true, 'Order item must have a product name at checkout.']
  },
  price: {
    type: Number,
    required: [true, 'Order item must record the product price at checkout.'],
    min: [0, 'Price cannot be negative.']
  },
  quantity: {
    type: Number,
    required: [true, 'Order item must record the quantity purchased.'],
    min: [1, 'Quantity must be at least 1.']
  }
});

// Define the schema for the Order
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      required: true
    },
    items: [orderItemSchema], // Snapshot of items bought
    totalPrice: {
      type: Number,
      required: [true, 'An order must have a total price.']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: 'Status must be either: pending, processing, shipped, delivered, or cancelled.'
      },
      default: 'pending'
    },
    shippingAddress: {
      type: String,
      required: [true, 'Please provide a shipping address. We need to know where to ship your items!'],
      trim: true
    }
  },
  {
    timestamps: true // Captures when order was created (createdAt) and updated
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
