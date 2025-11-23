import { Router } from 'express';
import { ExpressAuthController } from '../controller/express-auth-controller';
import { AuthMiddleware } from '../middleware/auth-middleware';

const authController = new ExpressAuthController();
const authRoutes = Router();

authRoutes.post('/signup', (req, res) => authController.signup(req, res));
authRoutes.post('/login', (req, res) => authController.login(req, res));

authRoutes.get('/me', AuthMiddleware.validateToken, (req, res) =>
  authController.getMe(req, res)
);

export { authRoutes };