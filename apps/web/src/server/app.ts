import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './middlewares/error-handler';
import { authMiddleware } from './middlewares/auth';
import { requestId, generalLimiter, authLimiter, securityHeaders } from './middlewares/security';
import { setupRoutes } from './routes';

const app = express();

app.use(requestId);
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(securityHeaders);
app.use(generalLimiter);

app.use('/api/auth', authLimiter);
app.use(authMiddleware);

setupRoutes(app);

app.use(errorHandler);

export default app;
