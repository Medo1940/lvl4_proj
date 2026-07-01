const dotenv = require('dotenv');

// 1. HANDLE UNCAUGHT EXCEPTIONS
// This catches programming errors made in synchronous code that weren't handled anywhere
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load variables from our .env file into process.env
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

// 2. CONNECT TO DATABASE
connectDB();

// 3. START THE SERVER
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`===============================================`);
  console.log(`Server is running in ${process.env.NODE_ENV} mode`);
  console.log(`Listening on port: ${port}`);
  console.log(`API URL: http://localhost:${port}`);
  console.log(`===============================================`);
});

// 4. HANDLE UNHANDLED REJECTIONS
// This catches database timeout errors, connection issues, or other failed async operations
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, err.message);
  // Close the server first so no new requests are accepted, then exit
  server.close(() => {
    process.exit(1);
  });
});
