const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    
    const PFEBook = require('../models/PFEBook');
    const count = await PFEBook.countDocuments();
    
    console.log(`📚 Connected to MongoDB (${count} books in collection)`);
    console.log(`🔗 Database: ${connection.connection.name}`);
    
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 Database connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database shutdown:', error);
    process.exit(1);
  }
});

module.exports = connectDB;
