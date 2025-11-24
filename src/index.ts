import express, { Application, Request, Response } from 'express';
import { userRoutes } from './user/infrastructure/routes/user-routes';
import { authRoutes } from './auth/infrastructure/routes/auth-routes';
import { AuthMiddleware } from './auth/infrastructure/middleware/auth-middleware';
import dotenv from 'dotenv';
import logger from '@logger';
import { config } from './share/infrastructure/config'; //  Import config for validation


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API is working correctly! 🚀',
    timestamp: new Date().toISOString(),
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

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;