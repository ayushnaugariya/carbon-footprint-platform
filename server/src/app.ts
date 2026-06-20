import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimiter.middleware';
import authRoutes from './routes/auth.routes';
import footprintRoutes from './routes/footprint.routes';
import insightsRoutes from './routes/insights.routes';
import actionsRoutes from './routes/actions.routes';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // Restrict cross-origin requests to the configured client origin only.
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  app.use(express.json({ limit: '100kb' }));
  app.use(generalRateLimiter);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/footprint', footprintRoutes);
  app.use('/api/insights', insightsRoutes);
  app.use('/api/actions', actionsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
