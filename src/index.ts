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
import { submissionsRouter } from './submissions/infrastructure/submissions.router';
import { prisma } from './share/infrastructure/prisma-client';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.app.nodeEnv !== 'production') {
  configureSwagger(app);
}

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API is working correctly! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      healthLive: '/health/live',
      healthReady: '/health/ready',
      auth: '/api/auth',
      users: '/api/user',
      tests: '/api/tests',
      courses: '/api/courses',
    },
  });
});

app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
  });
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ready',
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'unavailable',
      database: 'disconnected',
    });
  }
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

let isShuttingDown = false;

const shutdown = (signal: string): void => {
  if (isShuttingDown) return;

  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Maximum shutdown time: 8 seconds
  const timeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out');
    server.closeAllConnections();
    process.exit(1);
  }, 8000);

  // Stop accepting requests and wait for active requests
  server.close(async (error?: Error) => {
    if (error) {
      logger.error(`HTTP server close error: ${error.message}`);
    }

    try {
      await prisma.$disconnect();

      clearTimeout(timeout);
      logger.info('Server closed: HTTP server and Prisma disconnected');

      process.exit(error ? 1 : 0);
    } catch (err) {
      clearTimeout(timeout);
      logger.error(`Prisma shutdown error: ${String(err)}`);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
