import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import ticketRoutes from './routes/tickets.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (config.server.env === 'development') {
      return callback(null, true);
    }
    
    // In production, you would check against allowed origins
    const allowedOrigins = [
      'http://localhost:5173',  // Vite default dev server
      'http://localhost:3000',  // Common React dev server
      'http://localhost:4173'   // Vite preview server
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));

// Request parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for audio data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Service Hub API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tickets: '/api/tickets',
      ticketById: '/api/tickets/:id',
      ticketStats: '/api/tickets/stats/summary',
      serviceHealth: '/api/tickets/health/status'
    },
    documentation: 'See README.md for API documentation'
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(config.server.port, () => {
  console.log(`🚀 Smart Service Hub API running on port ${config.server.port}`);
  console.log(`📝 Environment: ${config.server.env}`);
  console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
  console.log(`📊 API endpoint: http://localhost:${config.server.port}/api/tickets`);
  
  if (config.server.env === 'development') {
    console.log(`🧪 Test with: curl http://localhost:${config.server.port}/health`);
  }
});

export default app;