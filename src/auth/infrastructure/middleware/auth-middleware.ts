import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      const decoded = jwt.verify(token, secret) as JWTPayload;

      req.userId = decoded.id;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Invalid token',
          message: error.message,
        });
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired, please login again',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Error validating token',
      });
    }
  }
}