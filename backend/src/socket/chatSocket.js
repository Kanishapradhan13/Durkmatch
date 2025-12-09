const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Store connected users
const connectedUsers = new Map();

const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user's socket
    connectedUsers.set(socket.userId, socket.id);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a match room
    socket.on('join_match', async (matchId) => {
      try {
        // Verify the match belongs to this user
        const match = await db.query(
          `SELECT id, user1_id, user2_id FROM matches
           WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true`,
          [matchId, socket.userId]
        );

        if (match.rows.length > 0) {
          socket.join(`match:${matchId}`);
          console.log(`User ${socket.userId} joined match ${matchId}`);
        }
      } catch (error) {
        console.error('Error joining match:', error);
      }
    });

    // Handle leaving a match room
    socket.on('leave_match', (matchId) => {
      socket.leave(`match:${matchId}`);
      console.log(`User ${socket.userId} left match ${matchId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { matchId, messageText } = data;

        // Verify the match belongs to this user
        const match = await db.query(
          `SELECT id, user1_id, user2_id FROM matches
           WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true`,
          [matchId, socket.userId]
        );

        if (match.rows.length === 0) {
          socket.emit('error', { message: 'Match not found or inactive' });
          return;
        }

        // Insert message into database
        const result = await db.query(
          `INSERT INTO messages (match_id, sender_id, message_text)
           VALUES ($1, $2, $3)
           RETURNING id, sender_id, message_text, sent_at, read_at`,
          [matchId, socket.userId, messageText]
        );

        const message = result.rows[0];

        // Get sender name
        const sender = await db.query(
          'SELECT name FROM users WHERE id = $1',
          [socket.userId]
        );

        message.sender_name = sender.rows[0].name;

        // Emit to all users in the match room
        io.to(`match:${matchId}`).emit('new_message', message);

        // Get the other user's ID
        const otherUserId = match.rows[0].user1_id === socket.userId
          ? match.rows[0].user2_id
          : match.rows[0].user1_id;

        // Send notification to the other user if they're online but not in the match room
        const otherUserSocketId = connectedUsers.get(otherUserId);
        if (otherUserSocketId) {
          io.to(`user:${otherUserId}`).emit('message_notification', {
            matchId,
            message
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', async (matchId) => {
      try {
        // Verify the match belongs to this user
        const match = await db.query(
          `SELECT id, user1_id, user2_id FROM matches
           WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
          [matchId, socket.userId]
        );

        if (match.rows.length > 0) {
          // Broadcast to others in the match room
          socket.to(`match:${matchId}`).emit('user_typing', {
            userId: socket.userId,
            matchId
          });
        }
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    socket.on('typing_stop', async (matchId) => {
      try {
        const match = await db.query(
          `SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
          [matchId, socket.userId]
        );

        if (match.rows.length > 0) {
          socket.to(`match:${matchId}`).emit('user_stopped_typing', {
            userId: socket.userId,
            matchId
          });
        }
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    // Handle match notification
    socket.on('new_match', (data) => {
      const { matchId, matchedUserId } = data;
      const matchedUserSocketId = connectedUsers.get(matchedUserId);

      if (matchedUserSocketId) {
        io.to(`user:${matchedUserId}`).emit('match_notification', {
          matchId,
          userId: socket.userId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

module.exports = { initializeSocket };
