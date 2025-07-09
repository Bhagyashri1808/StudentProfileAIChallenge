import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { db } from './config/sqlite-database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Student Profile API Server (SQLite)' });
});

app.get('/health', async (req, res) => {
  const dbConnected = await db.testConnection();
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected (SQLite)' : 'Disconnected'
  });
});

// Test database
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.get('SELECT COUNT(*) as count FROM users');
    res.json({ message: 'Database test successful', userCount: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed', details: (error as Error).message });
  }
});

// Start server
const startServer = async () => {
  try {
    await db.initialize();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();