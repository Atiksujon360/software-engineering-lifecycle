import cookieParser from 'cookie-parser';
import express from 'express';
import { apiRouter } from './routes';

export function createServerApp() {
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health probe
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return app;
}
