import express, { Application, Request, Response } from 'express';
import { userRoutes } from './user/infrastructure/routes/user-routes';
import { testRoutes } from './tests/infraestructure/routes/test-routes';

import dotenv from 'dotenv';
if (process.env.ENV === 'dev') {
  dotenv.config();
}

const app: Application = express();
const PORT = process.env.PORT ?? 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/api/user', userRoutes);
app.use('/api/tests', testRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Users API: http://localhost:${PORT}/api/user`);
  console.log(`Tests API: http://localhost:${PORT}/api/tests`);
});

export default app;
