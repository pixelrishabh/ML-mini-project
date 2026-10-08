const mongoose = require('mongoose');

let isConnectedToMongo = false;
const inMemoryPredictions = [];

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_performance';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fallback seamlessly if local MongoDB daemon isn't running
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.log(`[MongoDB] Warning: Local MongoDB daemon not reachable (${err.message}). Defaulting to zero-config in-memory persistence mode.`);
  }
};

module.exports = { connectDB, getIsConnected: () => isConnectedToMongo, inMemoryPredictions };
