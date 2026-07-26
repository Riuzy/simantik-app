import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { errorHandler } from './middlewares/error-handler';
import { authMiddleware } from './middlewares/auth';
import { requestIdMiddleware, generalLimiter, authLimiter, bodySizeLimiter, securityHeaders } from './middlewares/security';
import { logger, httpLogger } from './lib/logger';
import { setupRoutes } from './routes';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(pinoHttp({ logger: httpLogger }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodySizeLimiter('1mb'));
app.use(securityHeaders);
app.use(generalLimiter);

app.use('/api/auth', authLimiter);
app.use(authMiddleware);

setupRoutes(app);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SIMANTIK API Documentation',
}));

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
app.listen(PORT, () => {
  logger.info({ port: PORT }, `🚀 Server running on port ${PORT}`);
});

export default app;