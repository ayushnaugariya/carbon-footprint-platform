import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { closeDb } from '../config/db';

const app = createApp();

// A password that satisfies all complexity requirements: min 8, uppercase, digit.
const VALID_PASSWORD = 'Password1';

afterAll(() => {
  closeDb();
});

describe('Auth routes', () => {
  it('signs up a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'alice@example.com', password: VALID_PASSWORD, displayName: 'Alice' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects signup with a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'bob@example.com', password: VALID_PASSWORD, displayName: 'Bob' });
    const res = await request(app).post('/api/auth/signup').send({ email: 'bob@example.com', password: VALID_PASSWORD, displayName: 'Bob Again' });
    expect(res.status).toBe(409);
  });

  it('rejects signup with an invalid email', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'not-an-email', password: VALID_PASSWORD, displayName: 'Bob' });
    expect(res.status).toBe(400);
  });

  it('rejects signup with a too-short password', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'carol@example.com', password: 'Short1', displayName: 'Carol' });
    expect(res.status).toBe(400);
  });

  it('rejects signup with a password missing uppercase', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'carol2@example.com', password: 'password1', displayName: 'Carol' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/uppercase/i);
  });

  it('rejects signup with a password missing a digit', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'carol3@example.com', password: 'PasswordNoDigit', displayName: 'Carol' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/digit/i);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'dave@example.com', password: VALID_PASSWORD, displayName: 'Dave' });
    const res = await request(app).post('/api/auth/login').send({ email: 'dave@example.com', password: VALID_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with the wrong password', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'erin@example.com', password: VALID_PASSWORD, displayName: 'Erin' });
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
    const signupRes = await request(app).post('/api/auth/signup').send({ email: 'frank@example.com', password: VALID_PASSWORD, displayName: 'Frank' });
    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${signupRes.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('frank@example.com');
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects signup with excessively long email or password', async () => {
    // > 255 chars: 244 'a' + '@example.com' = 256 chars total
    const longEmail = 'a'.repeat(244) + '@example.com';
    const res1 = await request(app)
      .post('/api/auth/signup')
      .send({ email: longEmail, password: VALID_PASSWORD, displayName: 'Long' });
    expect(res1.status).toBe(400);

    const longPassword = 'A1' + 'a'.repeat(99); // > 100 chars
    const res2 = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'valid@example.com', password: longPassword, displayName: 'LongPass' });
    expect(res2.status).toBe(400);
  });

  it('normalizes email casing and trailing/leading whitespace', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: '  Normalized.User@Example.Com  ', password: VALID_PASSWORD, displayName: 'Normalized' });
    expect(signupRes.status).toBe(201);
    expect(signupRes.body.user.email).toBe('normalized.user@example.com');

    // Duplicate check must work even when casing differs.
    const duplicateRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'normalized.user@example.com', password: VALID_PASSWORD, displayName: 'Duplicate' });
    expect(duplicateRes.status).toBe(409);

    // Login with different casing/spacing should succeed.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: ' NORMALIZED.user@EXAMPLE.com ', password: VALID_PASSWORD });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('strips HTML tags from display names to prevent stored XSS', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'xss@example.com', password: VALID_PASSWORD, displayName: '<script>alert(1)</script>Hacker' });
    expect(res.status).toBe(201);
    // HTML tags should be stripped; the remaining text portion should be stored.
    expect(res.body.user.displayName).not.toContain('<script>');
    expect(res.body.user.displayName).not.toContain('</script>');
  });

  it('rejects JWTs signed with none or other invalid algorithms', async () => {
    const noneToken = jwt.sign({ userId: 'some-user', isGuest: false }, '', { algorithm: 'none' });
    const resNone = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${noneToken}`);
    expect(resNone.status).toBe(401);

    // HS384 should be rejected even with the correct secret.
    const secret = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me-32xx';
    const hs384Token = jwt.sign({ userId: 'some-user', isGuest: false }, secret, { algorithm: 'HS384' });
    const resHs384 = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${hs384Token}`);
    expect(resHs384.status).toBe(401);
  });

  it('error responses never include a stack trace field', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: VALID_PASSWORD, displayName: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.stack).toBeUndefined();
  });
});
