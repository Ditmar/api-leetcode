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

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario ya existe
 */
authRoutes.post('/signup', (req, res) => authController.signup(req, res));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un Access Token y Refresh Token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
authRoutes.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar Access Token
 *     description: Genera un nuevo Access Token utilizando un Refresh Token válido.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Refresh Token inválido
 */
authRoutes.post('/refresh', (req, res) =>
  authController.refreshToken(req, res)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el Refresh Token del usuario.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No autorizado
 */
authRoutes.post('/logout', (req, res) => authController.logout(req, res));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     description: Devuelve la información del usuario autenticado mediante JWT.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Token inválido o expirado
 */
authRoutes.get('/me', AuthMiddleware.validateToken, (req, res) =>
  authController.getMe(req, res)
);

export { authRoutes };
