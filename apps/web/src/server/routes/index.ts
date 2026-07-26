import { Application } from 'express';
import { authRouter } from '../modules/auth/routes';
import { projectRouter } from '../modules/project/routes';
import { userRouter } from '../modules/user/routes';
import { testCaseRouter } from '../modules/test-case/routes';
import { testExecutionRouter } from '../modules/test-execution/routes';
import { bugRouter } from '../modules/bug/routes';
import { notificationRouter } from '../modules/notification/routes';
import { activityLogRouter } from '../modules/activity-log/routes';

export const setupRoutes = (app: Application): void => {
  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/users', userRouter);
  app.use('/api/test-cases', testCaseRouter);
  app.use('/api', testExecutionRouter);
  app.use('/api/bugs', bugRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/activity-logs', activityLogRouter);
};