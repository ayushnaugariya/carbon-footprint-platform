import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/** General API rate limit - generous, just to blunt abuse/scraping. */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

/** Stricter rate limit for auth endpoints to slow down credential-stuffing/brute-force attempts. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' }
});
