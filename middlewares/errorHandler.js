const AppError = require('../utils/AppError');

// Helper to handle Mongoose invalid ObjectId errors (CastError)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}. Please use a correct ID format.`;
  return new AppError(message, 400);
};

// Helper to handle Mongoose duplicate keys (e.g. trying to create a category with an existing name)
const handleDuplicateFieldsDB = (err) => {
  // Extract the duplicate value using regex or object keys
  const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
  const message = `Duplicate value: "${value}". This name is already in use. Please choose another name.`;
  return new AppError(message, 400);
};

// Helper to handle Mongoose validation errors (missing fields, too short, etc.)
const handleValidationErrorDB = (err) => {
  // Extract all the validation messages and join them with a comma
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

// Detailed error response for developers during testing/development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Simplified, clean error response for users in production
const sendErrorProd = (err, res) => {
  // If it's an operational error (one we expected and formatted, e.g. validation error)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // If it's a programming bug or unknown server error, we hide the details from the user
    console.error('CRITICAL ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong on our server. Please try again later.',
    });
  }
};

// This is the global Express error-handling middleware. 
// Express knows it's an error handler because it has exactly FOUR arguments.
module.exports = (err, req, res, next) => {
  // Set default values for status code and status if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send different responses based on the environment
  if (process.env.NODE_ENV === 'development') {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Check for specific Mongoose error types and format them
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorDev(error, res);
  } else {
    // In production, we format critical Mongoose errors
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
