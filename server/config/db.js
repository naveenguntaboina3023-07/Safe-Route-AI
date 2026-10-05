const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('localhost') === false && uri === 'mongodb://localhost:27017/saferoute') {
    // keep isConnected false — memory store will be used
  }

  if (!uri) {
    console.warn('⚠️  MONGO_URI not set — using in-memory store (demo mode).');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    console.warn('⚠️  Using in-memory store — data will reset on server restart.');
  }
};

const dbConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.dbConnected = dbConnected;
