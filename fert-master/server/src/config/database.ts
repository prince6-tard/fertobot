import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fertobot';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    } as mongoose.ConnectOptions);

    logger.info('✅ MongoDB connected successfully');
    
    // Log database stats
    const stats = await mongoose.connection.db?.stats();
    logger.info(`📊 Database: ${mongoose.connection.name}`);
    logger.info(`📦 Collections: ${stats?.collections || 0}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('📡 Mongoose connection error:', err);
});

export default connectDB;
