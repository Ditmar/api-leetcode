import { Router } from 'express';
import { ExpressAuthController } from '../controller/express-auth-controller';
import { AuthMiddleware } from '../middleware/auth-middleware';
import { AuthSignup } from '../../application/auth-signup/auth-signup';
import { AuthLogin } from '../../application/auth-login/auth-login';
import { AuthGetMe } from '../../application/auth-get-me/auth-get-me';
import { AuthPrismaRepository } from '../repository/auth-prisma-repository';
import { prisma } from '../../../share/infrastructure/prisma-client';

// ✅ FIX: Create dependencies and inject them
const authRepository = new AuthPrismaRepository(prisma);
const signupUseCase = new AuthSignup(authRepository);
const loginUseCase = new AuthLogin(authRepository);
const getMeUseCase = new AuthGetMe(authRepository);

const authController = new ExpressAuthController(
  signupUseCase,
  loginUseCase,
  getMeUseCase
);

const authRoutes = Router();

// Public routes
authRoutes.post('/signup', (req, res) => authController.signup(req, res));
authRoutes.post('/login', (req, res) => authController.login(req, res));

// Protected routes
authRoutes.get('/me', AuthMiddleware.validateToken, (req, res) =>
  authController.getMe(req, res)
);

export { authRoutes };