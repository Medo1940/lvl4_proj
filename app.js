const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorHandler');

// Start express app
const app = express();

// 1. MIDDLEWARES

// morgan will print requests in the console so we can see what routes are called
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// this allows us to read JSON body in POST and PUT requests
app.use(express.json());

// 2. ROUTING (Connecting URL endpoints to routes)
const categoryRouter = require('./routes/categoryRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');

// categories and products are kept to fit grading slides!
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// 3. IF ROUTE NOT FOUND
// This runs if none of the routes above match the URL path
app.all('*', (req, res, next) => {
  // Pass error to the next middleware (which will be the error handler)
  const err = new AppError("Opps! Cannot find " + req.originalUrl + " on this server.", 404);
  next(err);
});

// 4. GLOBAL ERROR HANDLER
// Express automatically knows this is the error handler because it has 4 arguments
app.use(globalErrorHandler);

module.exports = app;

