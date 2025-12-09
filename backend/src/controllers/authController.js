const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const {
        email,
        password,
        name,
        age,
        gender,
        dzongkhag,
        bio,
        profile_photos,
        interests,
        education,
        occupation,
        preferred_language,
        zodiac_sign,
        preferred_gender,
        min_age,
        max_age,
        preferred_dzongkhags
      } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert new user
      const result = await db.query(
        `INSERT INTO users (
          email, password_hash, name, age, gender, dzongkhag, bio,
          interests, education, occupation, preferred_language, zodiac_sign,
          preferred_gender, min_age, max_age, preferred_dzongkhags, profile_photos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id, email, name, age, gender, dzongkhag, created_at`,
        [
          email,
          passwordHash,
          name,
          age,
          gender,
          dzongkhag,
          bio || null,
          interests || [],
          education || null,
          occupation || null,
          preferred_language || 'English',
          zodiac_sign || null,
          preferred_gender || 'both',
          min_age || 18,
          max_age || 100,
          preferred_dzongkhags || [],
          profile_photos || []
        ]
      );

      const user = result.rows[0];
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          dzongkhag: user.dzongkhag
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Error registering user' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT id, email, password_hash, name, is_active FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last_active timestamp
      await db.query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      const token = generateToken(user.id, user.email);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error logging in' });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await db.query(
        `SELECT
          id, email, name, age, gender, dzongkhag, bio,
          profile_photos, interests, education, occupation,
          preferred_language, zodiac_sign,
          preferred_gender, min_age, max_age, preferred_dzongkhags,
          created_at, updated_at, last_active
        FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Error fetching profile' });
    }
  }
};

module.exports = authController;
