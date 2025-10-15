const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Import routes
const resumeRoutes = require('../backend/src/routes/resumeRoutes');
const jobRoutes = require('../backend/src/routes/jobRoutes');
const matchRoutes = require('../backend/src/routes/matchRoutes');

const app = express();

// CORS configuration for Vercel
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
        'https://smart-resume-screener.vercel.app', // Replace with your actual Vercel domain
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads in serverless environment
const storage = multer.memoryStorage(); // Use memory storage for serverless
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Database connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        isConnected = true;
        console.log('MongoDB connected for serverless function');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Smart Resume Screener API is running on Vercel',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/resumes', (req, res, next) => {
    connectDB().then(() => next()).catch(next);
}, resumeRoutes);

app.use('/api/jobs', (req, res, next) => {
    connectDB().then(() => next()).catch(next);
}, jobRoutes);

app.use('/api/matches', (req, res, next) => {
    connectDB().then(() => next()).catch(next);
}, matchRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(error.status || 500).json({
        error: {
            message: error.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    });
});

// Export for Vercel serverless function
module.exports = app;