
// filepath: index.js
import express from 'express';
import webhookRoutes from './src/routes/webhookRoutes.js';
import { logger } from './src/middleware/logger.js';
import { config } from './src/config/config.js';
import { connectDB } from './src/config/database.js';

const app = express();
app.use(express.json());
app.disable('etag');

// Middleware
app.use(logger);

// Routes
app.use('/', webhookRoutes);

// Global error handling
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      console.log(`🚀 WhatsApp Bot running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();