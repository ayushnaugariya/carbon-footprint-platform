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

  // Trust the first proxy hop (Render, Vercel, Railway, Cloudflare, etc.) so
  // rate-limiting sees the real client IP rather than the proxy address.
  app.set('trust proxy', 1);

  // Defence-in-depth: explicitly remove the X-Powered-By header so attackers
  // cannot fingerprint the server technology from error responses.
  app.disable('x-powered-by');

  // Helmet sets a comprehensive set of security-related HTTP response headers.
  // We override the Content-Security-Policy to be explicit: this is a pure API
  // server that never serves HTML, so we lock everything down to deny.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' }
    })
  );

  // CORS: restrict to the configured origin only. Preflight requests from
  // unrecognised origins receive a 403 rather than a silent omission of the
  // ACAO header, making rejection behaviour explicit and auditable.
  const corsOptionsDelegate = (req: Request, callback: (err: Error | null, options?: cors.CorsOptions) => void) => {
    const origin = req.header('Origin');
    let allowed = false;

    if (!origin || origin === config.corsOrigin) {
      allowed = true;
    } else {
      const host = req.header('Host');
      if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
        allowed = true;
      } else if (origin.endsWith('.vercel.app')) {
        allowed = true;
      }
    }

    if (allowed) {
      callback(null, { origin: true, credentials: true });
    } else {
      callback(new Error(`CORS: origin '${origin}' is not allowed`), { origin: false });
    }
  };

  app.use(cors(corsOptionsDelegate));

  // Reject CORS preflight from disallowed origins before they reach any route.
  app.options('*', cors(corsOptionsDelegate) as any);

  // Tighter body size limits per route group to reduce DoS surface area.
  // Auth endpoints only need a small envelope; footprint inputs are larger.
  app.use('/api/auth', express.json({ limit: '4kb' }));
  app.use('/api/footprint', express.json({ limit: '8kb' }));
  app.use('/api/actions', express.json({ limit: '4kb' }));
  app.use('/api/insights', express.json({ limit: '2kb' }));
  // Fallback for health and any future routes.
  app.use(express.json({ limit: '16kb' }));

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
