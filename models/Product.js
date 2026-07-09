const mongoose = require('mongoose');

// This schema defines how an Anime Movie (Product) is saved in the database
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please type the movie name!'],
      unique: true, // we don't want duplicate movies
      trim: true,
      minlength: [3, 'The movie name must have at least 3 letters.']
    },
    description: {
      type: String,
      required: [true, 'Write a summary or description for this anime movie.'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide the ticket or rental price for this movie.'],
      min: [0, 'Movie price cannot be less than zero. We cannot pay people to watch it!']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // links the movie to its genre category
      required: [true, 'A movie must have a category (genre). Please link it to one.']
    },
    stock: {
      type: Number,
      required: [true, 'Please enter the available seats or tickets stock.'],
      default: 0,
      min: [0, 'Stock cannot be negative.'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number (integer). No half-seats allowed!'
      }
    }
  },
  {
    // automatically tracks when created and updated
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

