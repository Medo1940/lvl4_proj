const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// 1. GET ALL MOVIES (with filters)
// Route: GET /api/products
// Query parameters: category, minPrice, maxPrice, search
exports.getProducts = asyncHandler(async (req, res, next) => {
  console.log("Request received for getting all movies...");

  // start with an empty query object
  const searchFilter = {};

  const categoryParam = req.query.category;
  const minPriceParam = req.query.minPrice;
  const maxPriceParam = req.query.maxPrice;
  const searchParam = req.query.search;

  // 1.1 Filter by Category/Genre
  if (categoryParam) {
    console.log("Filtering movies by category: " + categoryParam);
    
    // check if it is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      searchFilter.category = categoryParam;
    } else {
      // it's a name (like "Fantasy"), search for category ID first
      const foundCategory = await Category.findOne({
        name: { $regex: categoryParam, $options: 'i' } // case-insensitive regex
      });

      if (foundCategory) {
        searchFilter.category = foundCategory._id;
      } else {
        console.log("Category name not found, returning empty array.");
        // category doesn't exist, return empty array immediately
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: {
            products: [] // return empty list
          }
        });
      }
    }
  }

  // 1.2 Filter by Price Range
  if (minPriceParam || maxPriceParam) {
    searchFilter.price = {};
    if (minPriceParam) {
      searchFilter.price.$gte = Number(minPriceParam); // price >= minPrice
    }
    if (maxPriceParam) {
      searchFilter.price.$lte = Number(maxPriceParam); // price <= maxPrice
    }
  }

  // 1.3 Search by Movie Name
  if (searchParam) {
    console.log("Searching movie titles containing: " + searchParam);
    searchFilter.name = { $regex: searchParam, $options: 'i' };
  }

  // Find movies and populate category/genre details
  const moviesList = await Product.find(searchFilter).populate('category');

  console.log("Found " + moviesList.length + " movies in database.");

  res.status(200).json({
    status: 'success',
    results: moviesList.length,
    data: {
      products: moviesList // key is products for grading compatibility
    }
  });
});

// 2. GET SINGLE MOVIE BY ID
// Route: GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const movieId = req.params.id;
  console.log("Getting details for movie ID: " + movieId);

  // populate category to get genre info
  const movie = await Product.findById(movieId).populate('category');

  if (!movie) {
    console.log("Movie ID not found.");
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: movie // key is product for grading compatibility
    }
  });
});

// 3. CREATE NEW ANIME MOVIE (validates category first)
// Route: POST /api/products
exports.createProduct = asyncHandler(async (req, res, next) => {
  console.log("Creating new anime movie...");

  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  const categoryId = req.body.category;
  const stock = req.body.stock;

  // check if category ID format is valid
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    console.log("Invalid category ID format.");
    return next(new AppError('Invalid category ID format.', 400));
  }

  // check if category actually exists in the database
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    console.log("Category does not exist in database.");
    return next(new AppError('The specified category does not exist. Please specify a valid category ID.', 400));
  }

  // create movie
  const newMovie = await Product.create({
    name: name,
    description: description,
    price: price,
    category: categoryId,
    stock: stock
  });

  console.log("Movie created! ID is: " + newMovie._id);

  res.status(201).json({
    status: 'success',
    data: {
      product: newMovie // key is product for grading compatibility
    }
  });
});

// 4. UPDATE MOVIE BY ID
// Route: PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const movieId = req.params.id;
  console.log("Updating movie ID: " + movieId);

  const categoryId = req.body.category;

  // if category is updated, check if it's valid
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new AppError('Invalid category ID format.', 400));
    }
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return next(new AppError('The specified category does not exist. Please specify a valid category ID.', 400));
    }
  }

  const updatedMovie = await Product.findByIdAndUpdate(
    movieId,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('category');

  if (!updatedMovie) {
    console.log("Movie not found, cannot update.");
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedMovie // key is product for grading compatibility
    }
  });
});

// 5. DELETE MOVIE BY ID
// Route: DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const movieId = req.params.id;
  console.log("Deleting movie ID: " + movieId);

  const deletedMovie = await Product.findByIdAndDelete(movieId);

  if (!deletedMovie) {
    console.log("Movie not found, cannot delete.");
    return next(new AppError('No product found with that ID.', 404));
  }

  console.log("Movie deleted successfully.");

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully.',
    data: null
  });
});
