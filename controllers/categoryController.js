const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET ALL CATEGORIES
// Route: GET /api/categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

// 2. GET SINGLE CATEGORY BY ID
// Route: GET /api/categories/:id
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  // If no category was found with that specific ID, throw a 404 error
  if (!category) {
    return next(new AppError('No category found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category
    }
  });
});

// 3. CREATE NEW CATEGORY
// Route: POST /api/categories
exports.createCategory = asyncHandler(async (req, res, next) => {
  const newCategory = await Category.create({
    name: req.body.name,
    description: req.body.description
  });

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
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,          // Return the modified document rather than the original
      runValidators: true // Run schema validations (e.g. minlength) on the update payload
    }
  );

  if (!updatedCategory) {
    return next(new AppError('No category found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category: updatedCategory
    }
  });
});

// 5. DELETE CATEGORY BY ID
// Route: DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;

  // Verify that the category exists first
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError('No category found with that ID.', 404));
  }

  // Check if there are any products belonging to this category
  const productsCount = await Product.countDocuments({ category: categoryId });
  if (productsCount > 0) {
    return next(
      new AppError(
        `Cannot delete category "${category.name}" because it is currently linked to ${productsCount} product(s). Please delete or update those products first!`,
        400
      )
    );
  }

  // Delete the category if no products are linked
  await Category.findByIdAndDelete(categoryId);

  res.status(200).json({
    status: 'success',
    message: 'Category deleted successfully.',
    data: null
  });
});
