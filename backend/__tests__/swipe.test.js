const request = require('supertest');
const { app } = require('../src/server');
const db = require('../src/config/database');

describe('Swipe and Match Endpoints', () => {
  let user1Token, user1Id;
  let user2Token, user2Id;

  beforeAll(async () => {
    // Create two test users
    const user1 = {
      email: `swipe1${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Swipe User 1',
      age: 25,
      gender: 'male',
      dzongkhag: 'Thimphu',
      preferred_gender: 'female',
      min_age: 22,
      max_age: 30
    };

    const user2 = {
      email: `swipe2${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Swipe User 2',
      age: 24,
      gender: 'female',
      dzongkhag: 'Thimphu',
      preferred_gender: 'male',
      min_age: 23,
      max_age: 28
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
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM matches WHERE user1_id = $1 OR user2_id = $1', [user1Id]);
    await db.query('DELETE FROM swipes WHERE user_id = $1', [user1Id]);
    await db.query('DELETE FROM users WHERE id IN ($1, $2)', [user1Id, user2Id]);
    await db.pool.end();
  });

  describe('GET /api/discover', () => {
    it('should return potential matches', async () => {
      const response = await request(app)
        .get('/api/discover')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should not show users already swiped', async () => {
      // First swipe on user2
      await request(app)
        .post('/api/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          targetUserId: user2Id,
          swipeType: 'like'
        });

      // Get discover users again
      const response = await request(app)
        .get('/api/discover')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // User2 should not be in the list
      const hasUser2 = response.body.users.some(u => u.id === user2Id);
      expect(hasUser2).toBe(false);
    });
  });

  describe('POST /api/swipe', () => {
    it('should record a like swipe', async () => {
      const response = await request(app)
        .post('/api/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          targetUserId: user2Id,
          swipeType: 'like'
        })
        .expect(200);

      expect(response.body).toHaveProperty('swipeType', 'like');
      expect(response.body).toHaveProperty('isMatch');
    });

    it('should create a match when both users like each other', async () => {
      // User1 likes User2 (already done in previous test)
      // User2 likes User1
      const response = await request(app)
        .post('/api/swipe')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          targetUserId: user1Id,
          swipeType: 'like'
        })
        .expect(200);

      expect(response.body).toHaveProperty('isMatch', true);
      expect(response.body).toHaveProperty('matchId');
    });

    it('should reject swipe without authentication', async () => {
      const response = await request(app)
        .post('/api/swipe')
        .send({
          targetUserId: user2Id,
          swipeType: 'like'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject swipe with invalid swipe type', async () => {
      const response = await request(app)
        .post('/api/swipe')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          targetUserId: user2Id,
          swipeType: 'invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/matches', () => {
    it('should return all matches for user', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.matches.length).toBeGreaterThan(0);
    });

    it('should include unread message count', async () => {
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      if (response.body.matches.length > 0) {
        expect(response.body.matches[0]).toHaveProperty('unread_count');
      }
    });
  });

  describe('DELETE /api/matches/:matchId', () => {
    let matchId;

    beforeAll(async () => {
      // Get the match ID
      const response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${user1Token}`);

      if (response.body.matches.length > 0) {
        matchId = response.body.matches[0].match_id;
      }
    });

    it('should unmatch successfully', async () => {
      if (matchId) {
        const response = await request(app)
          .delete(`/api/matches/${matchId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should not show unmatched user in matches list', async () => {
      if (matchId) {
        const response = await request(app)
          .get('/api/matches')
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        const hasMatch = response.body.matches.some(m => m.match_id === matchId);
        expect(hasMatch).toBe(false);
      }
    });
  });
});
