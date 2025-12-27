
// filepath: index.js
import express from 'express';
import cors from 'cors';
import webhookRoutes from './src/routes/webhookRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import sessionRoutes from './src/routes/sessionRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { logger } from './src/middleware/logger.js';
import { config } from './src/config/config.js';
import { connectDB } from './src/config/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('etag');
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/', webhookRoutes);  // webhookRoutes already defines /webhook path
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);

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