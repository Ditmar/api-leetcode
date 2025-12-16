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

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

const server = app.listen(config.app.port, () => {
  logger.info(`Server is running on port ${config.app.port}`);
  logger.info(`Environment: ${config.app.nodeEnv}`);
});

server.on('error', (err: Error) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

export default app;
