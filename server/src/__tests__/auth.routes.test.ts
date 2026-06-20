import request from 'supertest';
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
});
