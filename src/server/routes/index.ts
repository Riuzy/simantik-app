import { Application } from 'express';
import { authRouter } from '../modules/auth/routes';
import { projectRouter } from '../modules/project/routes';
import { testCaseRouter } from '../modules/test-case/routes';
import { automationRouter } from '../modules/automation/routes';
import { executionRouter } from '../modules/execution/routes';
import { reportRouter } from '../modules/report/routes';
import { settingRouter } from '../modules/setting/routes';

export const setupRoutes = (app: Application): void => {
  app.use('/api', automationRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/test-cases', testCaseRouter);
  app.use('/api/executions', executionRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/settings', settingRouter);
};
