import jwt from 'jsonwebtoken';
import { logger } from '@logger';

export interface JWTPayload {
  userId: string;
}

export class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret =
      process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (this.secret === 'default-secret-change-in-production') {
      logger.warn(
        '⚠️  Using default JWT_SECRET. Set JWT_SECRET in .env for production!'
      );
    }
  }

  verifyToken(token: string): string {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      logger.debug({ userId: decoded.userId }, 'JWT token verified');
      return decoded.userId;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('JWT token expired');
        throw new Error('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Invalid JWT token');
        throw new Error('Invalid token');
      }

      logger.error(error, 'Error verifying JWT token');
      throw new Error('Token verification failed');
    }
  }
}

export const jwtService = new JWTService();
