require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const journalRoutes = require('./routes/journalRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
connectDB();

// Create Express App
const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://naturejournal.vercel.app', // deployed frontend
  'http://localhost:5173' // local development frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Handle preflight requests
app.options('*', cors());

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NatureJournal API running 🚀'
  });
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/journal', journalRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: /health`);
});

module.exports = app;
