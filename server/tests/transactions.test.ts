import request from 'supertest';
import app from '../src/app';

// ---------------------------------------------------------------------------
// Transaction API Tests
// Tests cover: auth guard, ownership isolation, validation, CRUD.
// ---------------------------------------------------------------------------

let cookie: string;
let otherCookie: string;
let transactionId: string;

const userA = { name: 'User A', email: `usera_${Date.now()}@example.com`, password: 'password123', confirmPassword: 'password123' };
const userB = { name: 'User B', email: `userb_${Date.now()}@example.com`, password: 'password123', confirmPassword: 'password123' };

beforeAll(async () => {
  // Register and login User A
  await request(app).post('/api/auth/register').send(userA);
  const loginA = await request(app).post('/api/auth/login').send({ email: userA.email, password: userA.password });
  cookie = loginA.headers['set-cookie'][0];

  // Register and login User B
  await request(app).post('/api/auth/register').send(userB);
  const loginB = await request(app).post('/api/auth/login').send({ email: userB.email, password: userB.password });
  otherCookie = loginB.headers['set-cookie'][0];
});

describe('Transactions API', () => {
  describe('GET /api/transactions', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Cookie', cookie)
        .send({
          type: 'EXPENSE',
          amount: 50.0,
          category: 'Food',
          transactionDate: new Date().toISOString(),
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.category).toBe('Food');
      transactionId = res.body.id;
    });

    it('should reject a transaction with a negative amount', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Cookie', cookie)
        .send({
          type: 'EXPENSE',
          amount: -10,
          category: 'Food',
          transactionDate: new Date().toISOString(),
        });
      expect(res.status).toBe(400);
    });

    it('should reject a transaction with an invalid type', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Cookie', cookie)
        .send({
          type: 'INVALID_TYPE',
          amount: 10,
          category: 'Food',
          transactionDate: new Date().toISOString(),
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should prevent User B from accessing User A transaction', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Cookie', otherCookie);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/transactions/:id', () => {
    it('should prevent User B from updating User A transaction', async () => {
      const res = await request(app)
        .patch(`/api/transactions/${transactionId}`)
        .set('Cookie', otherCookie)
        .send({ amount: 999 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should prevent User B from deleting User A transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Cookie', otherCookie);
      expect(res.status).toBe(404);
    });

    it('should allow User A to delete their own transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
    });
  });
});
