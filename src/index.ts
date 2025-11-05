import express, { Application, Request, Response } from 'express';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta básica de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API funcionando correctamente! 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Ruta de health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});

export default app;
