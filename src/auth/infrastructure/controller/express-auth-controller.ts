import { Request, Response } from 'express';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
  ValidationError,
} from '../../domain/errors/auth-errors';
import logger from '@logger';
import { AuthSignup } from '../../application/auth-signup/auth-signup';
import { AuthLogin } from '../../application/auth-login/auth-login';
import { AuthGetMe } from '../../application/auth-get-me/auth-get-me';

//  FIX: Use dependency injection instead of global singleton
export class ExpressAuthController {
  constructor(
    private signupUseCase: AuthSignup,
    private loginUseCase: AuthLogin,
    private getMeUseCase: AuthGetMe
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

      logger.info(
        {
          userId: user.id.getValue(),
          email: user.email.getValue(),
          outcome: 'success',
        },
        'user.signup'
      );
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

      logger.info({ userId: result.user.id, outcome: 'success' }, 'user.login');

      res.status(200).json({
        access_token: result.token,
        token_type: 'Bearer',
        expires_in: result.expiresIn,
      });
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
}
