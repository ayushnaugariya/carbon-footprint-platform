import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { closeDb } from '../config/db';

const app = createApp();

afterAll(() => {
  closeDb();
});

describe('Auth routes', () => {
  it('signs up a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'alice@example.com', password: 'password123', displayName: 'Alice' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects signup with a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'bob@example.com', password: 'password123', displayName: 'Bob' });
    const res = await request(app).post('/api/auth/signup').send({ email: 'bob@example.com', password: 'password123', displayName: 'Bob Again' });
    expect(res.status).toBe(409);
  });

  it('rejects signup with an invalid email', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'not-an-email', password: 'password123', displayName: 'Bob' });
    expect(res.status).toBe(400);
  });

  it('rejects signup with a too-short password', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'carol@example.com', password: 'short', displayName: 'Carol' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'dave@example.com', password: 'password123', displayName: 'Dave' });
    const res = await request(app).post('/api/auth/login').send({ email: 'dave@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'erin@example.com', password: 'password123', displayName: 'Erin' });
    const res = await request(app).post('/api/auth/login').send({ email: 'erin@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('creates a guest session without requiring credentials', async () => {
    const res = await request(app).post('/api/auth/guest').send({});
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.isGuest).toBe(true);
  });

  it('returns the current user for a valid token', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({ email: 'frank@example.com', password: 'password123', displayName: 'Frank' });
    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${signupRes.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('frank@example.com');
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects signup with excessively long email or password', async () => {
    const longEmail = 'a'.repeat(250) + '@example.com'; // > 255 chars
    const res1 = await request(app)
      .post('/api/auth/signup')
      .send({ email: longEmail, password: 'password123', displayName: 'Long' });
    expect(res1.status).toBe(400);

    const longPassword = 'a'.repeat(101); // > 100 chars
    const res2 = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'valid@example.com', password: longPassword, displayName: 'LongPass' });
    expect(res2.status).toBe(400);
  });

  it('normalizes email casing and trailing/leading whitespace', async () => {
    // Signup with leading/trailing spaces and mixed casing
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: '  Normalized.User@Example.Com  ', password: 'password123', displayName: 'Normalized' });
    expect(signupRes.status).toBe(201);
    expect(signupRes.body.user.email).toBe('normalized.user@example.com');

    // Reject duplicate check even if case is different
    const duplicateRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'normalized.user@example.com', password: 'password123', displayName: 'Duplicate' });
    expect(duplicateRes.status).toBe(409);

    // Login with different casing/spacing should succeed
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: ' NORMALIZED.user@EXAMPLE.com ', password: 'password123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('rejects JWTs signed with none or other invalid algorithms', async () => {
    // Construct a token with algorithm set to 'none'
    const noneToken = jwt.sign({ userId: 'some-user', isGuest: false }, '', { algorithm: 'none' });
    const resNone = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${noneToken}`);
    expect(resNone.status).toBe(401);

    // Construct a token signed with HS384 instead of HS256 using the default secret (to verify algorithm check fails)
    const secret = process.env.JWT_SECRET || 'secret';
    const hs384Token = jwt.sign({ userId: 'some-user', isGuest: false }, secret, { algorithm: 'HS384' });
    const resHs384 = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${hs384Token}`);
    expect(resHs384.status).toBe(401);
  });
});

