const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for Lambda deployment - allow all origins
app.use(cors({
  origin: true, // Allow all origins for Lambda
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

// Body parser middleware to handle JSON payloads
app.use(express.json());

// Basic route to test API
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Mount all your routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/vacations', require('./routes/vacationRoutes'));
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware (should come after routes)
app.use(errorHandler);

// Start the server (commented out for Lambda deployment)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
