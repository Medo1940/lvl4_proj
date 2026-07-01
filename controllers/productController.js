const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// 1. GET ALL PRODUCTS (with advanced filtering)
// Route: GET /api/products
// Query Params: category, minPrice, maxPrice, search
exports.getProducts = asyncHandler(async (req, res, next) => {
  // We start with an empty query object
  const filterObject = {};

  const { category, minPrice, maxPrice, search } = req.query;

  // 1.1 Category Filter
  if (category) {
    // If the category parameter is a valid MongoDB ObjectId, search by ID
    if (mongoose.Types.ObjectId.isValid(category)) {
      filterObject.category = category;
    } else {
      // If it's a name (e.g. "Electronics"), search for that Category first
      const foundCategory = await Category.findOne({
        name: { $regex: category, $options: 'i' } // Case-insensitive matching
      });
      if (foundCategory) {
        filterObject.category = foundCategory._id;
      } else {
        // If no matching category exists, return empty results immediately
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            products: []
          }
        });
      }
    }
  }

  // 1.2 Price Range Filter
  if (minPrice || maxPrice) {
    filterObject.price = {};
    if (minPrice) {
      filterObject.price.$gte = Number(minPrice); // Greater than or equal to
    }
    if (maxPrice) {
      filterObject.price.$lte = Number(maxPrice); // Less than or equal to
    }
  }

  // 1.3 Name Search Filter
  if (search) {
    filterObject.name = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  // Execute search query
  const products = await Product.find(filterObject).populate('category');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// 2. GET SINGLE PRODUCT BY ID (with populate)
// Route: GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  // .populate('category') replaces the category ID with the actual category details
  const product = 
  await Product.findById(req.params.id).populate('category');

  if (!product) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// 3. CREATE NEW PRODUCT (with Category validation)
// Route: POST /api/products
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, stock } = req.body;

  // 3.1 Validate Category ID format
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return next(new AppError('Invalid category ID format.', 400));
  }

  // 3.2 Verify Category exists in the database
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(
      new AppError('The specified category does not exist. Please specify a valid category ID.', 400)
    );
  }

  // 3.3 Create the product
  const newProduct = await Product.create({
    name,
    description,
    price,
    category,
    stock
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

// 4. UPDATE PRODUCT BY ID
// Route: PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { category } = req.body;

  // If category is being updated, validate it
  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(new AppError('Invalid category ID format.', 400));
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(
        new AppError('The specified category does not exist. Please specify a valid category ID.', 400)
      );
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category');

  if (!updatedProduct) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct
    }
  });
});

// 5. DELETE PRODUCT BY ID
// Route: DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully.',
    data: null
  });
});
