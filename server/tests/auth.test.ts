import request from 'supertest';
import app from '../src/app';

// ---------------------------------------------------------------------------
// NOTE: These integration tests require a live PostgreSQL database.
// They use the DATABASE_URL from the .env file in the server directory.
// ---------------------------------------------------------------------------

describe('Auth API', () => {
  const uniqueEmail = `test_${Date.now()}@example.com`;

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
          confirmPassword: 'password123',
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(uniqueEmail);
      // Password hash must never be returned
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with mismatched passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: `bad_${Date.now()}@example.com`,
          password: 'password123',
          confirmPassword: 'differentpassword',
        });
      expect(res.status).toBe(400);
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail, // same email as above
          password: 'password123',
          confirmPassword: 'password123',
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials and set a cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: uniqueEmail, password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: uniqueEmail, password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
