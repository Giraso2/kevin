const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes - No middleware
router.post('/login', (req, res, next) => {
  console.log('Login route hit');
  next();
}, login);

// Protected routes
router.get('/me', protect, getMe);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

module.exports = router;