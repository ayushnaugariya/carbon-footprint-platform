import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config/env';

/** General API rate limit - generous, just to blunt abuse/scraping. */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  // Bucket by IP + path prefix so each endpoint has an independent counter.
  keyGenerator: (req: Request) => `${req.ip}:${req.path.split('/')[2] ?? ''}`,
  message: { error: 'Too many requests. Please try again later.' }
});

/** Stricter rate limit for auth endpoints to slow down credential-stuffing/brute-force.
 *  Successful requests are skipped from the count so legitimate users are not penalised. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => `auth:${req.ip}:${req.path}`,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});
