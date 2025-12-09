const db = require('../config/database');

const messageController = {
  // Get messages for a specific match
  getMessages: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { matchId } = req.params;
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      // Verify the match belongs to the current user
      const match = await db.query(
        `SELECT id, user1_id, user2_id FROM matches
         WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true`,
        [matchId, userId]
      );

      if (match.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Get messages
      const messages = await db.query(
        `SELECT
          m.id, m.sender_id, m.message_text, m.sent_at, m.read_at,
          u.name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.match_id = $1 AND m.is_deleted = false
        ORDER BY m.sent_at DESC
        LIMIT $2 OFFSET $3`,
        [matchId, limit, offset]
      );

      // Mark messages as read if they're from the other user
      await db.query(
        `UPDATE messages
         SET read_at = CURRENT_TIMESTAMP
         WHERE match_id = $1 AND sender_id != $2 AND read_at IS NULL`,
        [matchId, userId]
      );

      res.json({
        messages: messages.rows.reverse(), // Reverse to show oldest first
        count: messages.rows.length
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  },

  // Send a message
  sendMessage: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { matchId, messageText } = req.body;

      // Verify the match belongs to the current user
      const match = await db.query(
        `SELECT id, user1_id, user2_id FROM matches
         WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true`,
        [matchId, userId]
      );

      if (match.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found or inactive' });
      }

      // Insert message
      const result = await db.query(
        `INSERT INTO messages (match_id, sender_id, message_text)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, message_text, sent_at, read_at`,
        [matchId, userId, messageText]
      );

      const message = result.rows[0];

      // Get sender name
      const sender = await db.query(
        'SELECT name FROM users WHERE id = $1',
        [userId]
      );

      message.sender_name = sender.rows[0].name;

      res.status(201).json({
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Error sending message' });
    }
  },

  // Mark message as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { messageId } = req.params;

      // Verify the message belongs to a match the user is part of
      const result = await db.query(
        `UPDATE messages
         SET read_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND sender_id != $2
           AND match_id IN (
             SELECT id FROM matches
             WHERE (user1_id = $2 OR user2_id = $2) AND is_active = true
           )
         RETURNING id`,
        [messageId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Error marking message as read' });
    }
  },

  // Delete a message (soft delete)
  deleteMessage: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { messageId } = req.params;

      // Only allow deletion of own messages
      const result = await db.query(
        `UPDATE messages
         SET is_deleted = true
         WHERE id = $1 AND sender_id = $2
         RETURNING id`,
        [messageId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Message not found or unauthorized' });
      }

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Error deleting message' });
    }
  }
};

module.exports = messageController;
