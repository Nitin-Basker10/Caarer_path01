// ============================================
// server.js - Main Backend Server
// ============================================
// This server runs on PORT 5050 (as shown in your screenshot)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Allow requests from your Vite frontend (port 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// MONGODB CONNECTION
// ============================================
const dns = require('dns');
dns.setServers(['8.8.8.8','1.1.1.1']); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpath';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📁 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('💡 Make sure MongoDB is running!');
  console.error('   - Mac: brew services start mongodb-community');
  console.error('   - Windows: Start MongoDB service');
  console.error('   - Or use MongoDB Atlas (cloud)');
});

// MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
});

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const progressRoutes = require('./routes/progress.routes');
const careerRoutes = require('./routes/career.routes');
const opportunityRoutes = require('./routes/opportunity.routes');
const communityRoutes = require('./routes/community.routes');

// ============================================
// REGISTER ROUTES
// ============================================

app.use('/api/auth', authRoutes);              // Authentication
app.use('/api/users', userRoutes);             // User management
app.use('/api/progress', progressRoutes);      // Progress tracking
app.use('/api/career', careerRoutes);          // Career paths
app.use('/api/opportunities', opportunityRoutes); // Opportunities
app.use('/api/community', communityRoutes);    // Community posts

// ============================================
// HEALTH CHECK & ROOT ENDPOINTS
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'CareerPath Backend is running successfully',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5050,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to CareerPath API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth (POST /register, /login)',
      users: '/api/users (GET /profile, PUT /profile)',
      progress: '/api/progress (GET /, POST /complete-skill)',
      career: '/api/career (GET /paths)',
      opportunities: '/api/opportunities (GET /)',
      community: '/api/community (GET /posts, POST /posts)'
    },
    documentation: 'See README.md for full API documentation'
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    message: 'The endpoint you are looking for does not exist'
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Error occurred:');
  console.error(err.stack);
  
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5050;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🚀  CareerPath Backend Started!');
  console.log('🚀 ================================');
  console.log(`📍 Server URL:  http://localhost:${PORT}`);
  console.log(`📍 API Base:    http://localhost:${PORT}/api`);
  console.log(`💚 Health:      http://localhost:${PORT}/api/health`);
  console.log(`📚 Frontend:    http://localhost:5173 (Vite)`);
  console.log('🚀 ================================');
  console.log('');
  console.log('💡 Ready to accept requests!');
  console.log('');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================


const gracefulShutdown = () => {
  console.log('\n⚠️  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

module.exports = app;