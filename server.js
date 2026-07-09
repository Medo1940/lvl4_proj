const dotenv = require('dotenv');

// 1. CATCH SYNCHRONOUS CODE ERRORS
// If there is an error in our code that we forgot to catch, this stops the server
process.on('uncaughtException', (err) => {
  console.log("OH NO! Synchronous error happened somewhere:");
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

// Load the settings from .env file
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

// Connect to MongoDB
connectDB();

// Start our express server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log("=========================================");
  console.log("Anime Movie Server is starting up... :)");
  console.log("Port is: " + port);
  console.log("Server mode is: " + process.env.NODE_ENV);
  console.log("API URL: http://localhost:" + port);
  console.log("=========================================");
});

// 2. CATCH ASYNC PROMISE ERRORS
// This catches database connections failing or other async errors
process.on('unhandledRejection', (err) => {
  console.log("OH NO! Unhandled async rejection happened:");
  console.log(err.name, err.message);
  // close the server first and then exit
  server.close(() => {
    process.exit(1);
  });
});

