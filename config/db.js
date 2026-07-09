const mongoose = require('mongoose');

let mongod = null; // this will hold our temporary database if we don't have mongodb installed

// This function connects our app to the MongoDB database
const connectDB = async () => {
  try {
    // we get the connection string from env file or use a default one
    let connURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anime_movies_db';
    
    console.log("Checking MongoDB database status at: " + connURI + " ...");

    // try to connect to the database
    try {
      await mongoose.connect(connURI, {
        serverSelectionTimeoutMS: 2000 // wait for 2 seconds only, if it fails then go to catch block
      });
      console.log("Connected to MongoDB successfully! Host: " + mongoose.connection.host);
    } catch (connError) {
      console.log("Local MongoDB is offline or not running: " + connError.message);
      console.log("Starting temporary In-Memory MongoDB Server because we cannot connect to local db...");

      // load the in-memory server
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        binary: {
          version: '6.0.14' // good version for windows
        }
      });
      
      connURI = mongod.getUri();
      
      // connect to the in-memory server now
      await mongoose.connect(connURI);
      console.log("Connected to local in-memory MongoDB database!");
      console.log("Connection URI is: " + connURI);
    }
  } catch (error) {
    console.error("Database connection critical error: " + error.message);
    process.exit(1); // stop everything
  }
};

// This function stops the database (very useful for seed script)
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log("In-memory MongoDB database has been stopped.");
    }
  } catch (error) {
    console.error("Error when disconnecting: " + error.message);
  }
};

module.exports = { connectDB, disconnectDB };

