const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { profileUpdateValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

router.get('/profile/:id', userController.getUserProfile);
router.put('/profile', profileUpdateValidation, userController.updateProfile);
router.post('/upload-photo', userController.uploadPhoto);
router.delete('/photo/:photoIndex', userController.deletePhoto);

module.exports = router;
