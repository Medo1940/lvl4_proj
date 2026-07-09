const mongoose = require('mongoose');

// This schema defines how a Category (Anime Genre/Studio) is saved in database
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please type a category name! Every category must have a name.'],
      unique: true, // we don't want two Action categories
      trim: true,   // removes extra spaces
      minlength: [3, 'A category name must be at least 3 letters long.']
    },
    description: {
      type: String,
      required: [true, 'Write a short description to tell us what this category contains!'],
      trim: true
    }
  },
  {
    // automatically add when it was created and updated
    timestamps: true
  }
);

// Make the model so we can use it in controllers
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

