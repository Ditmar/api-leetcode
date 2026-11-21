import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { config } from '@config';
import logger from '@logger';
import express, { Application, Request, Response } from 'express';
import { authRoutes } from './auth/infrastructure/routes/auth-routes';
import { testRoutes } from './tests/infraestructure/routes/test-routes';
import { courseRoutes } from './course/infrastructure/routes/course-routes';
import { contestRoutes } from './contests/infrastructure/contests.router';
import { problemsRouter } from './problems/infrastructure/problems.router';
import { configureSwagger } from './config/swagger.config';
import { submissionsRouter } from './submissions/infrastructure/submissions.router';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.app.nodeEnv !== 'production') {
  configureSwagger(app);
}

// Public routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API is working correctly! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      tests: '/api/tests',
      courses: '/api/courses',
    },
  });
});

app.use('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
  });
});

// API-006 (#60): legacy /api/user routes are disabled; code remains in Git history.
// Profile/statistics replacement: API-032 (https://github.com/Ditmar/api-leetcode/issues/86).
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemsRouter);
app.use('/api', submissionsRouter);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

const server = app.listen(config.app.port, () => {
  logger.info(`Server is running on port ${config.app.port}`);

  if (config.app.nodeEnv !== 'production') {
    logger.info(`Swagger is running on port ${config.app.port}/api-docs`);
  }

  logger.info(`Environment: ${config.app.nodeEnv}`);
});

server.on('error', (err: Error) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

export default app;
