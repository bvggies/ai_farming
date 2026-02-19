/**
 * Backend server entry point (Express).
 * Mounts all API routes under /api (auth, users, posts, AI, knowledge, notifications, admin).
 * Uses Prisma for the database; JWT for authentication.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Allow frontend to call this API from another origin; parse JSON and form bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API route modules: each handles a group of endpoints (e.g. /api/auth/login, /api/posts)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/admin', require('./routes/admin'));

// Simple health check so deployers can verify the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Appah Farms Knowledge Hub API is running' });
});

// Prisma initialization (database connection handled per request by Prisma)
try {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Please configure Neon Postgres connection.');
  }
} catch (e) {
  console.error('Error initializing database config:', e);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

