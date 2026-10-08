const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const predictionRoutes = require('./routes/predictionRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    service: 'Student Performance Prediction API'
  });
});

// API Routes
app.use('/api', predictionRoutes);
// Legacy route support for seamless frontend connection
app.use('/', predictionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Express Backend] Server running on http://localhost:${PORT}`);
});
