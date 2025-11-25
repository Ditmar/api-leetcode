import { config } from '@config';
import logger from '@logger';
import express, { Application, Request, Response } from 'express';
import { AuthMiddleware } from './auth/infrastructure/middleware/auth-middleware';
import { authRoutes } from './auth/infrastructure/routes/auth-routes';
import { userRoutes } from './user/infrastructure/routes/user-routes';

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
      users: '/api/user',
      tests: '/api/tests',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
  });
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// User routes (protected)
app.use('/api/user', AuthMiddleware.validateToken, userRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(config.app.port, () => {
  logger.info(`Server is running on port ${config.app.port}`);
  logger.info(`Environment: ${config.app.nodeEnv}`);
});

export default app;
