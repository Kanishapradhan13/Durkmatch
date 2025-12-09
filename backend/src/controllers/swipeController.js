const db = require('../config/database');

const swipeController = {
  // Get potential matches for discovery
  getDiscoverUsers: async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 10;

      // Get user's preferences
      const userResult = await db.query(
        `SELECT preferred_gender, min_age, max_age, preferred_dzongkhags, gender
         FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      const { preferred_gender, min_age, max_age, preferred_dzongkhags } = user;

      // Build query to find potential matches
      let query = `
        SELECT
          u.id, u.name, u.age, u.gender, u.dzongkhag, u.bio,
          u.profile_photos, u.interests, u.education, u.occupation, u.zodiac_sign
        FROM users u
        WHERE u.id != $1
          AND u.is_active = true
          AND u.age BETWEEN $2 AND $3
          AND u.id NOT IN (
            SELECT target_user_id FROM swipes WHERE user_id = $1
          )
      `;

      const params = [userId, min_age, max_age];
      let paramCount = 4;

      // Filter by preferred gender
      if (preferred_gender && preferred_gender !== 'both') {
        query += ` AND u.gender = $${paramCount}`;
        params.push(preferred_gender);
        paramCount++;
      }

      // Filter by preferred dzongkhags if specified
      if (preferred_dzongkhags && preferred_dzongkhags.length > 0) {
        query += ` AND u.dzongkhag = ANY($${paramCount})`;
        params.push(preferred_dzongkhags);
        paramCount++;
      }

      // Also check if the potential match would be interested in current user
      // This ensures mutual compatibility
      query += `
        AND (
          u.preferred_gender = 'both'
          OR u.preferred_gender = $${paramCount}
        )
        AND $${paramCount + 1} BETWEEN u.min_age AND u.max_age
      `;
      params.push(user.gender, user.age || 25);
      paramCount += 2;

      query += ` ORDER BY RANDOM() LIMIT $${paramCount}`;
      params.push(limit);

      const result = await db.query(query, params);

      res.json({
        users: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Get discover users error:', error);
      res.status(500).json({ error: 'Error fetching potential matches' });
    }
  },

  // Record a swipe (like or pass)
  recordSwipe: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { targetUserId, swipeType } = req.body;

      // Prevent swiping on yourself
      if (userId === targetUserId) {
        return res.status(400).json({ error: 'Cannot swipe on yourself' });
      }

      // Check if target user exists
      const targetUser = await db.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [targetUserId]
      );

      if (targetUser.rows.length === 0) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Record the swipe
      await db.query(
        `INSERT INTO swipes (user_id, target_user_id, swipe_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, target_user_id) DO UPDATE
         SET swipe_type = $3, created_at = CURRENT_TIMESTAMP`,
        [userId, targetUserId, swipeType]
      );

      let isMatch = false;
      let matchId = null;

      // If it's a like, check if there's a mutual match
      if (swipeType === 'like') {
        const mutualLike = await db.query(
          `SELECT id FROM swipes
           WHERE user_id = $1 AND target_user_id = $2 AND swipe_type = 'like'`,
          [targetUserId, userId]
        );

        if (mutualLike.rows.length > 0) {
          // Create a match
          isMatch = true;

          // Ensure user1_id < user2_id for the unique constraint
          const [user1, user2] = userId < targetUserId
            ? [userId, targetUserId]
            : [targetUserId, userId];

          const matchResult = await db.query(
            `INSERT INTO matches (user1_id, user2_id)
             VALUES ($1, $2)
             ON CONFLICT (user1_id, user2_id) DO UPDATE
             SET matched_at = CURRENT_TIMESTAMP, is_active = true
             RETURNING id`,
            [user1, user2]
          );

          matchId = matchResult.rows[0].id;
        }
      }

      res.json({
        message: 'Swipe recorded successfully',
        swipeType,
        isMatch,
        matchId
      });
    } catch (error) {
      console.error('Record swipe error:', error);
      res.status(500).json({ error: 'Error recording swipe' });
    }
  },

  // Get all matches for current user
  getMatches: async (req, res) => {
    try {
      const userId = req.user.userId;

      const result = await db.query(
        `SELECT
          m.id as match_id,
          m.matched_at,
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END as matched_user_id,
          u.name, u.age, u.gender, u.dzongkhag, u.bio, u.profile_photos,
          u.interests, u.occupation, u.zodiac_sign,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE match_id = m.id AND sender_id != $1 AND read_at IS NULL
          ) as unread_count
        FROM matches m
        JOIN users u ON (
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END = u.id
        )
        WHERE (m.user1_id = $1 OR m.user2_id = $1)
          AND m.is_active = true
          AND u.is_active = true
        ORDER BY m.matched_at DESC`,
        [userId]
      );

      res.json({
        matches: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Get matches error:', error);
      res.status(500).json({ error: 'Error fetching matches' });
    }
  },

  // Unmatch with a user
  unmatch: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { matchId } = req.params;

      // Verify the match belongs to the current user
      const match = await db.query(
        `SELECT id FROM matches
         WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
        [matchId, userId]
      );

      if (match.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Deactivate the match instead of deleting
      await db.query(
        'UPDATE matches SET is_active = false WHERE id = $1',
        [matchId]
      );

      res.json({ message: 'Unmatched successfully' });
    } catch (error) {
      console.error('Unmatch error:', error);
      res.status(500).json({ error: 'Error unmatching' });
    }
  }
};

module.exports = swipeController;
