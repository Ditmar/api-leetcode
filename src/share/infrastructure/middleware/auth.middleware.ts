import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  req.user = {
    id: parseInt(userId, 10),
    email: 'user@example.com',
  };

  next();
};
