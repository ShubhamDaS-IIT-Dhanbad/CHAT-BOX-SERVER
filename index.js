import { app, server } from './app.js';
import connectDB from './config/mongoDB.js';

// server.js
import dotenv from 'dotenv';
import winston from 'winston';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Set up winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    app.close(() => {
      logger.info('HTTP server closed.');
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });
    });
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => shutdown(signal));
