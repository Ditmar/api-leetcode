import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '@logger';
import { config } from '../../../share/infrastructure/config';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthMiddleware {
  static validateToken(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'No token provided',
          message: 'Authorization header must be in format: Bearer <token>',
        });
        return;
      }

      const token = authHeader.substring(7);

      // ✅ FIX: Use config validated at startup + explicit algorithm
      const decoded = jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      req.userId = decoded.id;

      next();
    } catch (error) {
      // ✅ FIX: Check TokenExpiredError BEFORE JsonWebTokenError
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Token expired for request');
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired, please login again',
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn(
          `Invalid token for request - Path: ${req.path}, Error: ${error.message}`
        );
        res.status(401).json({
          error: 'Invalid token',
          message: error.message,
        });
        return;
      }

      logger.error('Unexpected error validating token', undefined, String(error));
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error validating token',
      });
    }
  }
}