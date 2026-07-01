const mongoose = require('mongoose');

// Define the blueprint (Schema) for a Product
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name. every product needs a name!'],
      unique: true,
      trim: true,
      minlength: [3, 'A product name must have at least 3 characters.']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the product.'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price. We need to know how much the product costs.'],
      min: [0, 'Product price cannot be negative. You cannot pay the customer to take it!']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // This links the product to the Category model
      required: [true, 'A product must belong to a category. Please link it to a category.']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide the stock quantity.'],
      default: 0,
      min: [0, 'Stock quantity cannot be negative. We cannot have less than zero items in stock!'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be a whole number (integer). You cannot have half a product!'
      }
    }
  },
  {
    // Automatically add createdAt and updatedAt tags
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
