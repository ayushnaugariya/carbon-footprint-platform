import dotenv from 'dotenv';

dotenv.config();

function requireInProduction(name: string, value: string | undefined, fallbackForDev: string): string {
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallbackForDev;
}

function validateJwtSecret(secret: string): string {
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production to resist brute-force attacks.');
  }
  return secret;
}

/** Accepts jwt-style duration strings like "7d", "24h", "3600s". Rejects "0", empty, etc. */
function validateJwtExpiresIn(value: string): string {
  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error(`Invalid JWT_EXPIRES_IN value "${value}". Expected a duration like "7d", "24h", "3600s".`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  // In production this MUST be set via a real secret; in dev we fall back to
  // a clearly-labeled placeholder so the app still runs out of the box.
  jwtSecret: validateJwtSecret(
    requireInProduction('JWT_SECRET', process.env.JWT_SECRET, 'dev-only-insecure-secret-change-me-32xx')
  ),
  jwtExpiresIn: validateJwtExpiresIn(process.env.JWT_EXPIRES_IN ?? '7d'),
  dbPath: process.env.DB_PATH ?? './data/app.json',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '300', 10)
};
