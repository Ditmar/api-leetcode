import { Request, Response, NextFunction } from 'express';
import { logger } from '@logger';
import { CourseNotFoundError } from '../../../course/domain/errors/course-not-found-error';
import { AlreadyEnrolledError } from '../../../course/domain/errors/already-enrolled-error';
import { UserNotFoundError } from '../../../user/domain/errors/user-not-found-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next;
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof CourseNotFoundError || err instanceof UserNotFoundError) {
    res.status(404).json({
      error: 'Resource not found',
      message: err.message,
    });
    return;
  }

  if (err instanceof AlreadyEnrolledError) {
    res.status(409).json({
      error: 'Conflict',
      message: err.message,
    });
    return;
  }

  if (
    err.message.includes('must be') ||
    err.message.includes('cannot be') ||
    err.message.includes('Invalid')
  ) {
    res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.',
  });
};
