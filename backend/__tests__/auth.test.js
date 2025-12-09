const request = require('supertest');
const { app } = require('../src/server');
const db = require('../src/config/database');

describe('Authentication Endpoints', () => {
  let testUserId;

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await db.pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123',
        name: 'Test User',
        age: 25,
        gender: 'male',
        dzongkhag: 'Thimphu',
        bio: 'Test bio',
        preferred_gender: 'female',
        min_age: 22,
        max_age: 30
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.name).toBe(newUser.name);

      testUserId = response.body.user.id;
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'TestPassword123',
        name: 'Test User',
        age: 25,
        gender: 'male',
        dzongkhag: 'Thimphu'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordUser = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
        age: 25,
        gender: 'male',
        dzongkhag: 'Thimphu'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject registration with age under 18', async () => {
      const underageUser = {
        email: 'underage@example.com',
        password: 'TestPassword123',
        name: 'Test User',
        age: 17,
        gender: 'male',
        dzongkhag: 'Thimphu'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(underageUser)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: `logintest${Date.now()}@example.com`,
      password: 'TestPassword123',
      name: 'Login Test',
      age: 26,
      gender: 'female',
      dzongkhag: 'Paro'
    };

    beforeAll(async () => {
      // Register a user for login tests
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      testUserId = response.body.user.id;
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeAll(async () => {
      // Register and login to get token
      const user = {
        email: `profile${Date.now()}@example.com`,
        password: 'TestPassword123',
        name: 'Profile Test',
        age: 27,
        gender: 'male',
        dzongkhag: 'Punakha'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(user);

      authToken = registerResponse.body.token;
      testUserId = registerResponse.body.user.id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });
});
