import { Request, Response } from 'express';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  ValidationError,
} from '../../domain/errors/auth-errors';
import {
  RefreshTokenNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../domain/errors/refresh-token-errors';
import logger from '@logger';
import { AuthSignup } from '../../application/auth-signup/auth-signup';
import { AuthLogin } from '../../application/auth-login/auth-login';
import { AuthGetMe } from '../../application/auth-get-me/auth-get-me';
import { AuthRefreshToken } from '../../application/auth-refresh-token/auth-refresh-token';
import { AuthLogout } from '../../application/auth-logout/auth-logout';

//  FIX: Use dependency injection instead of global singleton
export class ExpressAuthController {
  constructor(
    private signupUseCase: AuthSignup,
    private loginUseCase: AuthLogin,
    private getMeUseCase: AuthGetMe,
    private refreshTokenUseCase: AuthRefreshToken,
    private logoutUseCase: AuthLogout
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, email and password are required',
        });
        return;
      }

      const user = await this.signupUseCase.execute(name, email, password);

      logger.info(`User registered successfully: ${user.email.getValue()}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
      });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        res.status(409).json({
          error: 'User already exists',
          message: error.message,
        });
        return;
      }

      //  FIX: Only map ValidationError to 400
      if (error instanceof ValidationError) {
        res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
        return;
      }

      //  FIX: Map domain validation errors (from VOs) to 400
      if (
        error instanceof Error &&
        (error.message.includes('cannot be empty') ||
          error.message.includes('must be at least') ||
          error.message.includes('Invalid email format'))
      ) {
        res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
        return;
      }

      //  FIX: All other errors are 500
      logger.error({ message: 'Unexpected error in signup', error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error creating user',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.loginUseCase.execute(email, password);

      logger.info(`User logged in successfully: ${email}`);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({
          error: 'Invalid credentials',
          message: error.message,
        });
        return;
      }

      //  FIX: Only validation errors to 400
      if (
        error instanceof ValidationError ||
        (error instanceof Error &&
          error.message.includes('Invalid email format'))
      ) {
        res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
        return;
      }

      //  FIX: Everything else is 500
      logger.error({ message: 'Unexpected error in login', error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error logging in',
      });
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID not found in token',
        });
        return;
      }

      const user = await this.getMeUseCase.execute(userId);

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({
          error: 'User not found',
          message: error.message,
        });
        return;
      }

      logger.error({ message: 'Unexpected error in getMe', error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error getting user information',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);

      logger.info('Access token refreshed successfully');

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof RefreshTokenNotFoundError) {
        res.status(404).json({
          error: 'Refresh token not found',
          message: error.message,
        });
        return;
      }

      if (error instanceof RefreshTokenExpiredError) {
        res.status(401).json({
          error: 'Refresh token expired',
          message: error.message,
        });
        return;
      }

      if (error instanceof RefreshTokenRevokedError) {
        res.status(401).json({
          error: 'Refresh token revoked',
          message: error.message,
        });
        return;
      }

      logger.error({ message: 'Unexpected error in refreshToken', error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error refreshing token',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'Refresh token is required',
        });
        return;
      }

      await this.logoutUseCase.execute(refreshToken);

      logger.info('User logged out successfully');

      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      if (error instanceof RefreshTokenNotFoundError) {
        res.status(404).json({
          error: 'Refresh token not found',
          message: error.message,
        });
        return;
      }

      logger.error({ message: 'Unexpected error in logout', error });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error logging out',
      });
    }
  }
}
