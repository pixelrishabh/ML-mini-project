const mongoose = require('mongoose');

let isConnectedToMongo = false;
const inMemoryPredictions = [];

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_performance';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 2000
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[MongoDB] Warning: Local MongoDB daemon not reachable (${err.message}). Running in temporary session in-memory storage mode.`);
  }
};

const getStorageStatus = () => {
  return {
    isConnected: isConnectedToMongo,
    storageType: isConnectedToMongo ? 'MongoDB Collection' : 'In-Memory Session Mode',
    isPersistent: isConnectedToMongo,
    warning: isConnectedToMongo
      ? null
      : 'Notice: MongoDB connection is currently offline. Predictions are kept in an active in-memory session buffer and will not persist permanently across backend server restarts.'
  };
};

module.exports = {
  connectDB,
  getIsConnected: () => isConnectedToMongo,
  getStorageStatus,
  inMemoryPredictions
};
