import { Router } from 'express';
import { ExpressAuthController } from '../controller/express-auth-controller';
import { AuthMiddleware } from '../middleware/auth-middleware';
import { AuthSignup } from '../../application/auth-signup/auth-signup';
import { AuthLogin } from '../../application/auth-login/auth-login';
import { AuthGetMe } from '../../application/auth-get-me/auth-get-me';
import { AuthRefreshToken } from '../../application/auth-refresh-token/auth-refresh-token';
import { AuthLogout } from '../../application/auth-logout/auth-logout';
import { AuthPrismaRepository } from '../repository/auth-prisma-repository';
import { RefreshTokenPrismaRepository } from '../repository/refresh-token-prisma-repository';
import { prisma } from '../../../share/infrastructure/prisma-client';

//  FIX: Create dependencies and inject them
const authRepository = new AuthPrismaRepository(prisma);
const refreshTokenRepository = new RefreshTokenPrismaRepository(prisma);

const signupUseCase = new AuthSignup(authRepository);
const loginUseCase = new AuthLogin(authRepository, refreshTokenRepository);
const getMeUseCase = new AuthGetMe(authRepository);
const refreshTokenUseCase = new AuthRefreshToken(
  authRepository,
  refreshTokenRepository
);
const logoutUseCase = new AuthLogout(refreshTokenRepository);

const authController = new ExpressAuthController(
  signupUseCase,
  loginUseCase,
  getMeUseCase,
  refreshTokenUseCase,
  logoutUseCase
);

const authRoutes = Router();

// Public routes
authRoutes.post('/signup', (req, res) => authController.signup(req, res));
authRoutes.post('/login', (req, res) => authController.login(req, res));
authRoutes.post('/refresh', (req, res) =>
  authController.refreshToken(req, res)
);
authRoutes.post('/logout', (req, res) => authController.logout(req, res));

// Protected routes
authRoutes.get('/me', AuthMiddleware.validateToken, (req, res) =>
  authController.getMe(req, res)
);

export { authRoutes };
