const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    const PFEBook = require('../models/PFEBook');
    await PFEBook.countDocuments();
    return connection;
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on('connected', () => {});

mongoose.connection.on('error', () => {});

mongoose.connection.on('disconnected', () => {});

process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

module.exports = connectDB;
