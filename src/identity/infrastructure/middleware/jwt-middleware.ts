import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config';

export class JwtMiddleware {
  static validate(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    try {
      jwt.verify(header.replace('Bearer ', ''), config.JWT.secret);
      next();
      return;
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  }
}
