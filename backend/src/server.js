import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'BugFlow AI Backend API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      bugs: '/api/bugs',
    },
  });
});

// Primary API Router mounted at /api
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Central Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  BugFlow AI Backend Server running`);
  console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Health URL  : http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

export default app;
