const mongoose = require('mongoose');

let mongod = null;

// This function connects our application to the MongoDB database
const connectDB = async () => {
  try {
    // We get the connection string (URI) from our .env file.
    let connURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';
    
    console.log(`Checking MongoDB database status at: ${connURI}...`);

    // 1. Attempt to connect to the configured URI first
    try {
      await mongoose.connect(connURI, {
        serverSelectionTimeoutMS: 2000 // Timeout quickly (2 seconds) if local DB is offline
      });
      console.log(`✅ MongoDB Connected successfully to: ${mongoose.connection.host}`);
    } catch (connError) {
      console.log(`⚠️ Local MongoDB service is offline or refused connection (Reason: ${connError.message}).`);
      console.log(`🚀 Starting educational In-Memory MongoDB Server (v6.0.14) fallback...`);

      // 2. Load and spin up the in-memory MongoDB server
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create({
        binary: {
          version: '6.0.14' // Use a version that has high compatibility with Windows 10
        }
      });
      
      connURI = mongod.getUri();
      
      // 3. Connect to the in-memory server
      await mongoose.connect(connURI);
      console.log(`✅ Connected successfully to local in-memory MongoDB database!`);
      console.log(`🔗 In-memory Connection URI: ${connURI}`);
    }
  } catch (error) {
    console.error(`❌ Database connection critical error: ${error.message}`);
    process.exit(1);
  }
};

// This function cleans up and disconnects the database connections (used in seed and tests)
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('🛑 In-memory MongoDB database stopped.');
    }
  } catch (error) {
    console.error(`Error during database disconnect: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
