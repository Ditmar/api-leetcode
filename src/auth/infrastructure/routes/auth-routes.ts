import { Router } from 'express';
import { AuthController } from '../controller/auth-controller';
const authController = new AuthController();
const authRoutes = Router();

authRoutes.post('/login', (req, res) => authController.login(req, res));
authRoutes.post('/register', (req, res) => authController.register(req, res));
authRoutes.get('/refresh-token', (req, res) => authController.refreshToken(req, res));

export { authRoutes };