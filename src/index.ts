import express, { Application, Request, Response } from 'express';
import { userRoutes } from './user/infrastructure/routes/user-routes';
import { authRoutes } from './auth/infrastructure/routes/auth-routes';
import { AuthMiddleware } from './auth/infrastructure/middleware/auth-middleware';
import dotenv from 'dotenv';
import logger from '@logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/auth', authRoutes);

app.use('/api/user', AuthMiddleware.validateToken, userRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;