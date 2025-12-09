const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimit');

// Public routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
