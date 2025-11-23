import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../domain/errors/auth-errors';
import logger from '@logger';

export class ExpressAuthController {
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

      const user = await services.auth.signup.execute(name, email, password);

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

      if (error instanceof Error) {
        res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
        return;
      }

      logger.error('Error in signup: %s', (error as Error).message ?? 'Unknown error');
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

      const result = await services.auth.login.execute(email, password);

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

      if (error instanceof Error) {
        res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
        return;
      }

      logger.error('Error in login: %s', (error as Error).message ?? 'Unknown error');
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

      const user = await services.auth.getMe.execute(userId);

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({
          error: 'User not found',
          message: error.message,
        });
        return;
      }

      logger.error('Error in getMe: %s', (error as Error).message ?? 'Unknown error');
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error getting user information',
      });
    }
  }
}