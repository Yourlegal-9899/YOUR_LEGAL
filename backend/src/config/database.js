const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;

mongoose.set('bufferCommands', false);

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  try {
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    if (cachedPromise && mongoose.connection.readyState === 2) {
      const conn = await cachedPromise;
      cachedConnection = conn;
      return conn;
    }

    if (!cachedPromise) {
      cachedPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
    }

    const conn = await cachedPromise;
    cachedConnection = conn;

    if (conn.connection.readyState === 1) {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

    return conn;
  } catch (error) {
    cachedConnection = null;
    cachedPromise = null;
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
