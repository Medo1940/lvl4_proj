// asyncHandler is a utility wrapper function that eliminates the need for try/catch blocks
// in our controllers. It takes an asynchronous function and returns a standard Express route handler.
// If the async function fails (rejects), the error is caught and passed to the next() function
// which forwards it to our central error handling middleware.
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Resolve the promise from the async function. If it throws an error (rejects),
    // .catch(next) will automatically call next(error).
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
