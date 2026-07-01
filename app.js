const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');

// Initialize the Express application
const app = express();

// 1. GLOBAL MIDDLEWARES

// morgan prints requests in the console, making it easy to see GET/POST/etc commands
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// express.json() is needed to read the body data from POST and PUT requests as JSON
app.use(express.json());

// 2. ROUTE MOUNTING (Connecting paths to specific routers)
// Note: We will import these routers shortly
const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');

app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// 3. FALLBACK FOR UNHANDLED ROUTES
// If a request hits this, it means none of the above routes matched the path
app.all('*', (req, res, next) => {
  // We pass a new AppError to next() - Express will immediately jump to the error handler
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// 4. CENTRAL ERROR HANDLER MIDDLEWARE
// Handles all formatting and returns errors as JSON
app.use(globalErrorHandler);

module.exports = app;
