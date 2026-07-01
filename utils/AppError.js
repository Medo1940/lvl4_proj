// AppError is a custom error class that extends the standard JavaScript Error class.
// We use this to create structured errors with HTTP status codes (e.g., 404, 400).
class AppError extends Error {
  constructor(message, statusCode) {
    // 1. Call the constructor of the parent Error class with the error message
    super(message);

    // 2. Set the HTTP status code (e.g. 404, 400, 500)
    this.statusCode = statusCode;

    // 3. Set a status string: 'fail' for 4xx errors, 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // 4. Mark this error as "operational". 
    // Operational errors are predictable errors that we can handle (like validation errors).
    // Non-operational errors are programming bugs, network failures, etc.
    this.isOperational = true;

    // 5. Capture the stack trace (the sequence of function calls that led to the error)
    // and exclude this constructor from the trace to keep it clean.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
