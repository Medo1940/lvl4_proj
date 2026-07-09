const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET ALL CATEGORIES
// Route: GET /api/categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  console.log("Someone is asking for all anime categories/genres...");
  
  const categories = await Category.find();

  console.log("Found " + categories.length + " categories.");

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories: categories
    }
  });
});

// 2. GET A SINGLE CATEGORY BY ITS ID
// Route: GET /api/categories/:id
exports.getCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;
  console.log("Searching for category ID: " + categoryId);
  
  const category = await Category.findById(categoryId);

  // if not found, we tell the user that the ID doesn't exist
  if (!category) {
    console.log("Category ID not found in database.");
    return next(new AppError('No category found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category: category
    }
  });
});

// 3. CREATE A NEW CATEGORY
// Route: POST /api/categories
exports.createCategory = asyncHandler(async (req, res, next) => {
  console.log("Creating a new category...");
  
  // we read the values from request body
  const name = req.body.name;
  const description = req.body.description;

  const newCategory = await Category.create({
    name: name,
    description: description
  });

  console.log("Category created successfully! ID is: " + newCategory._id);

  res.status(201).json({
    status: 'success',
    data: {
      category: newCategory
    }
  });
});

// 4. UPDATE CATEGORY BY ID
// Route: PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;
  console.log("Updating category ID: " + categoryId);

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    req.body,
    {
      new: true,          // this returns the updated category instead of old one
      runValidators: true // this makes sure validations are checked (e.g. minlength)
    }
  );

  if (!updatedCategory) {
    console.log("Could not update. Category not found.");
    return next(new AppError('No category found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category: updatedCategory
    }
  });
});

// 5. DELETE A CATEGORY BY ID
// Route: DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;
  console.log("Request to delete category ID: " + categoryId);

  // First check if the category even exists
  const category = await Category.findById(categoryId);
  if (!category) {
    console.log("Category not found, cannot delete.");
    return next(new AppError('No category found with that ID.', 404));
  }

  // Very important check: do we have anime movies under this category?
  // If yes, we shouldn't delete it or the movies will have no category!
  const productsCount = await Product.countDocuments({ category: categoryId });
  if (productsCount > 0) {
    console.log("Cannot delete: category has " + productsCount + " movies linked to it.");
    return next(
      new AppError(
        'Cannot delete category "' + category.name + '" because it has ' + productsCount + ' movie(s) in it. Please delete the movies first!',
        400
      )
    );
  }

  // Delete it if there are no movies in it
  await Category.findByIdAndDelete(categoryId);
  console.log("Deleted category successfully.");

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully.',
    data: null
  });
});

