const db = require('../config/database');
const { MAX_PHOTOS } = require('../config/constants');

const userController = {
  // Get user profile by ID
  getUserProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.userId;

      const result = await db.query(
        `SELECT
          id, name, age, gender, dzongkhag, bio,
          profile_photos, interests, education, occupation,
          preferred_language, zodiac_sign
        FROM users WHERE id = $1 AND is_active = true`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't show profile to users who shouldn't see it
      if (parseInt(id) === currentUserId) {
        return res.status(400).json({ error: 'Cannot view your own profile this way' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Error fetching user profile' });
    }
  },

  // Update current user's profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const updates = req.body;

      // Build dynamic update query
      const allowedFields = [
        'name', 'age', 'gender', 'dzongkhag', 'bio',
        'profile_photos', 'interests', 'education', 'occupation',
        'preferred_language', 'zodiac_sign',
        'preferred_gender', 'min_age', 'max_age', 'preferred_dzongkhags'
      ];

      const updateFields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(userId);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING
          id, email, name, age, gender, dzongkhag, bio,
          profile_photos, interests, education, occupation,
          preferred_language, zodiac_sign,
          preferred_gender, min_age, max_age, preferred_dzongkhags
      `;

      const result = await db.query(query, values);

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Error updating profile' });
    }
  },

  // Upload profile photo
  uploadPhoto: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { photoData } = req.body; // Base64 encoded image data

      if (!photoData) {
        return res.status(400).json({ error: 'Photo data is required' });
      }

      // Get current photos
      const currentUser = await db.query(
        'SELECT profile_photos FROM users WHERE id = $1',
        [userId]
      );

      const currentPhotos = currentUser.rows[0].profile_photos || [];

      if (currentPhotos.length >= MAX_PHOTOS) {
        return res.status(400).json({
          error: `Maximum ${MAX_PHOTOS} photos allowed`
        });
      }

      // Add new photo
      const updatedPhotos = [...currentPhotos, photoData];

      await db.query(
        'UPDATE users SET profile_photos = $1 WHERE id = $2',
        [updatedPhotos, userId]
      );

      res.json({
        message: 'Photo uploaded successfully',
        photos: updatedPhotos
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({ error: 'Error uploading photo' });
    }
  },

  // Delete profile photo
  deletePhoto: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { photoIndex } = req.params;

      const index = parseInt(photoIndex);

      // Get current photos
      const currentUser = await db.query(
        'SELECT profile_photos FROM users WHERE id = $1',
        [userId]
      );

      const currentPhotos = currentUser.rows[0].profile_photos || [];

      if (index < 0 || index >= currentPhotos.length) {
        return res.status(400).json({ error: 'Invalid photo index' });
      }

      // Remove photo at index
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);

      await db.query(
        'UPDATE users SET profile_photos = $1 WHERE id = $2',
        [updatedPhotos, userId]
      );

      res.json({
        message: 'Photo deleted successfully',
        photos: updatedPhotos
      });
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({ error: 'Error deleting photo' });
    }
  }
};

module.exports = userController;
