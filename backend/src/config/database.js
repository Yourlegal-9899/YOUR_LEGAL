const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
  try {
    if (cachedConnection) {
      return cachedConnection;
    }

    if (!cachedPromise) {
      cachedPromise = mongoose.connect(process.env.MONGODB_URI);
    }

    const conn = await cachedPromise;
    cachedConnection = conn;

    if (conn.connection.readyState === 1) {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

    return conn;
  } catch (error) {
    cachedPromise = null;
    throw error;
  } 
};

module.exports = connectDB;
