import dotenv from 'dotenv';

dotenv.config();

function requireInProduction(name: string, value: string | undefined, fallbackForDev: string): string {
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallbackForDev;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  // In production this MUST be set via a real secret; in dev we fall back to
  // a clearly-labeled placeholder so the app still runs out of the box.
  jwtSecret: requireInProduction('JWT_SECRET', process.env.JWT_SECRET, 'dev-only-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  dbPath: process.env.DB_PATH ?? './data/app.json',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10)
};
