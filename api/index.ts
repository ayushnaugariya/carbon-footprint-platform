import { createApp } from './server/src/app';

// Ensure correct environment variables in serverless context
process.env.NODE_ENV = 'production';
process.env.DB_PATH = '/tmp/app.json'; // /tmp is the only writable directory in serverless
process.env.JWT_SECRET = process.env.JWT_SECRET || 'vercel-serverless-jwt-fallback-secret-32-chars';

const app = createApp();

export default app;
