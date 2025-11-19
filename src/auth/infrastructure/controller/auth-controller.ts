import { Response } from 'express';
import { LoginRequest, RegisterRequest } from './types/types';
import { services } from '../../../share/infrastructure/services';
import { logger } from '@logger';

export class AuthController {
  async login(request: LoginRequest, response: Response): Promise<void> {
    const { username, password } = request.body;
    try {
      const token = await services.auth.login.execute(username, password);
      response.status(200).json({ token });
    } catch (error) {
      logger.error('Login error: ' + (error as Error).message);
      response.status(401).json({ error: 'The token can not be generated' });
    }
  }
  async register(request: RegisterRequest, response: Response): Promise<void> {
    const { username, password, email } = request.body;
    try {
      const message = await services.auth.register.execute(
        username,
        password,
        email
      );
      response.status(201).json({ message });
    } catch (error) {
      logger.error('Registration error: ' + (error as Error).message);
      response.status(400).json({ error: 'User registration failed' });
    }
  }
}
