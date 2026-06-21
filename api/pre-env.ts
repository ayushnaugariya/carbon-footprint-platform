// Initialize production environment variables before other imports execute
process.env.NODE_ENV = 'production';
process.env.DB_PATH = '/tmp/app.json'; // Writable serverless directory
process.env.JWT_SECRET = process.env.JWT_SECRET || 'vercel-serverless-jwt-fallback-secret-32-chars';
