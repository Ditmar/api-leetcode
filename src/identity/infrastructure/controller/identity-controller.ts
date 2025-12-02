import { Request, Response } from 'express';
import { services } from '../../infrastructure/services';
import { RegisterDTO, LoginDTO } from '../dto/identity-dto';
import logger from '@logger';

export class IdentityController {
  async register(req: Request, res: Response): Promise<void> {
    const parsed = RegisterDTO.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.flatten() });
      return;
    }
    try {
      await services.identity.register.execute(
        parsed.data.username,
        parsed.data.email,
        parsed.data.password
      );
      res.status(201).json({ message: 'User registered successfully' });
      return;
    } catch (err) {
      logger.error((err as Error).message);
      res.status(409).json({ message: (err as Error).message });
      return;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const parsed = LoginDTO.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Invalid payload', errors: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;
    try {
      const token = await services.identity.login.execute(email, password);
      res.status(200).json(token);
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Login failed: ${message}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
  }
}
