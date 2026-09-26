import request from 'supertest';
import app from '../src/app';

// ---------------------------------------------------------------------------
// Budget API Tests
// Tests cover: duplicate prevention, auth guard.
// ---------------------------------------------------------------------------

let cookie: string;

const budgetUser = { name: 'Budget User', email: `budget_${Date.now()}@example.com`, password: 'password123', confirmPassword: 'password123' };

beforeAll(async () => {
  await request(app).post('/api/auth/register').send(budgetUser);
  const login = await request(app).post('/api/auth/login').send({ email: budgetUser.email, password: budgetUser.password });
  cookie = login.headers['set-cookie'][0];
});

describe('Budgets API', () => {
  describe('POST /api/budgets', () => {
    it('should create a budget for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Cookie', cookie)
        .send({ category: 'Food', monthlyLimit: 300, month: 1, year: 2026 });
      expect(res.status).toBe(201);
      expect(res.body.category).toBe('Food');
    });

    it('should prevent duplicate budget for same category/month/year', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Cookie', cookie)
        .send({ category: 'Food', monthlyLimit: 500, month: 1, year: 2026 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('should reject budget with negative limit', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Cookie', cookie)
        .send({ category: 'Transport', monthlyLimit: -100, month: 1, year: 2026 });
      expect(res.status).toBe(400);
    });

    it('should reject budget with invalid month (> 12)', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Cookie', cookie)
        .send({ category: 'Transport', monthlyLimit: 100, month: 13, year: 2026 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/budgets', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/budgets');
      expect(res.status).toBe(401);
    });
  });
});
