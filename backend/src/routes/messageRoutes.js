const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { messageValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

router.get('/:matchId', messageController.getMessages);
router.post('/', messageValidation, messageController.sendMessage);
router.put('/:messageId/read', messageController.markAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
