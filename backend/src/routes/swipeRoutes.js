const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipeController');
const { authenticateToken } = require('../middleware/auth');
const { swipeValidation } = require('../middleware/validation');
const { swipeLimiter } = require('../middleware/rateLimit');

// All routes require authentication
router.use(authenticateToken);

router.get('/discover', swipeController.getDiscoverUsers);
router.post('/swipe', swipeLimiter, swipeValidation, swipeController.recordSwipe);
router.get('/matches', swipeController.getMatches);
router.delete('/matches/:matchId', swipeController.unmatch);

module.exports = router;
