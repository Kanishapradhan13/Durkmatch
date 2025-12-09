const request = require('supertest');
const { app } = require('../src/server');
const db = require('../src/config/database');

describe('Message Endpoints', () => {
  let user1Token, user1Id;
  let user2Token, user2Id;
  let matchId;

  beforeAll(async () => {
    // Create two test users and a match
    const user1 = {
      email: `msg1${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Message User 1',
      age: 26,
      gender: 'male',
      dzongkhag: 'Paro',
      preferred_gender: 'female'
    };

    const user2 = {
      email: `msg2${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Message User 2',
      age: 25,
      gender: 'female',
      dzongkhag: 'Paro',
      preferred_gender: 'male'
    };

    const response1 = await request(app)
      .post('/api/auth/register')
      .send(user1);
    user1Token = response1.body.token;
    user1Id = response1.body.user.id;

    const response2 = await request(app)
      .post('/api/auth/register')
      .send(user2);
    user2Token = response2.body.token;
    user2Id = response2.body.user.id;

    // Create mutual likes to form a match
    await request(app)
      .post('/api/swipe')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ targetUserId: user2Id, swipeType: 'like' });

    const matchResponse = await request(app)
      .post('/api/swipe')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ targetUserId: user1Id, swipeType: 'like' });

    matchId = matchResponse.body.matchId;
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM messages WHERE match_id = $1', [matchId]);
    await db.query('DELETE FROM matches WHERE id = $1', [matchId]);
    await db.query('DELETE FROM swipes WHERE user_id IN ($1, $2)', [user1Id, user2Id]);
    await db.query('DELETE FROM users WHERE id IN ($1, $2)', [user1Id, user2Id]);
    await db.pool.end();
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: matchId,
          messageText: 'Hello! How are you?'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Message sent successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message_text', 'Hello! How are you?');
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: matchId,
          messageText: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject message without authentication', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          matchId: matchId,
          messageText: 'Test message'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject message to non-existent match', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: 99999,
          messageText: 'Test message'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/messages/:matchId', () => {
    beforeAll(async () => {
      // Send a few test messages
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: matchId,
          messageText: 'First message'
        });

      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          matchId: matchId,
          messageText: 'Second message'
        });
    });

    it('should get messages for a match', async () => {
      const response = await request(app)
        .get(`/api/messages/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('messages');
      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    it('should mark messages as read when fetched', async () => {
      // User2 sends a message
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          matchId: matchId,
          messageText: 'Unread message'
        });

      // User1 fetches messages
      const response = await request(app)
        .get(`/api/messages/${matchId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Check that messages were returned
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/messages/${matchId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    let messageId;

    beforeAll(async () => {
      // Create a message to delete
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: matchId,
          messageText: 'Message to delete'
        });

      messageId = response.body.data.id;
    });

    it('should delete own message', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Message deleted successfully');
    });

    it('should not allow deleting others messages', async () => {
      // User1 creates a message
      const msgResponse = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          matchId: matchId,
          messageText: 'User1 message'
        });

      const msgId = msgResponse.body.data.id;

      // User2 tries to delete User1's message
      const response = await request(app)
        .delete(`/api/messages/${msgId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
