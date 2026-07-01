const mongoose = require('mongoose');

// Define the blueprint (Schema) for a Category
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name. Every category needs a name!'],
      unique: true, // Prevents duplicate categories
      trim: true,   // Removes extra spaces from both ends (e.g. "  Books " becomes "Books")
      minlength: [3, 'A category name must have at least 3 characters.']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description. Tell us what is in this category!'],
      trim: true
    }
  },
  {
    // Options: Automatically add createdAt and updatedAt date tags
    timestamps: true
  }
);

// Create the Category model from the schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
