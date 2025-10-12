require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { checkServices } = require('./src/config/services');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    await checkServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
