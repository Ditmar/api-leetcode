import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { config } from '@config';
import logger from '@logger';
import express, { Application, Request, Response } from 'express';
import { AuthMiddleware } from './auth/infrastructure/middleware/auth-middleware';
import { authRoutes } from './auth/infrastructure/routes/auth-routes';
import { userRoutes } from './user/infrastructure/routes/user-routes';
import { testRoutes } from './tests/infraestructure/routes/test-routes';
import { courseRoutes } from './course/infrastructure/routes/course-routes';
import { contestRoutes } from './contests/infrastructure/contests.router';
import { problemsRouter } from './problems/infrastructure/problems.router';
import { configureSwagger } from './config/swagger.config';

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
      users: '/api/user',
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

app.use('/api/auth', authRoutes);
app.use('/api/user', AuthMiddleware.validateToken, userRoutes);
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
