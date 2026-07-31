import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { errorHandler } from './middlewares/error-handler';
import { authMiddleware } from './middlewares/auth';
import { requestId, generalLimiter, authLimiter, securityHeaders } from './middlewares/security';
import { logger } from './lib/logger';
import { ensureConnection } from './lib/prisma';
import { setupRoutes } from './routes';

const app = express();

app.use(requestId);
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(securityHeaders);
app.use(generalLimiter);

app.use('/api/auth', authLimiter);
app.use(authMiddleware);

setupRoutes(app);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/ready', (_req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() });
});

app.get('/api/version', (_req, res) => {
  res.json({ version: process.env.APP_VERSION || '1.0.0', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = config.port;

async function start() {
  const dbConnected = await ensureConnection();
  if (!dbConnected) {
    logger.warn('Starting without database connection. Some features will be unavailable.');
  }

  app.listen(PORT, () => {
    logger.info({ port: PORT }, `Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});

export default app;
