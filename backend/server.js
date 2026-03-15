require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const journalRoutes = require('./routes/journalRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();


const app = express();


const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // local frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins[0] === '*') {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NatureJournal API is running 🚀',
  });
});

// Health Check Route

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────
app.use('/api/journal', journalRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});


app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health Check: /health`);
});


module.exports = app;
