import { NextFunction, Request, Response } from 'express';
import logger from '@logger';

const isBodyParseError = (error: unknown): boolean => {
  if (error instanceof SyntaxError) {
    const syntaxError = error as SyntaxError & {
      status?: number;
      body?: unknown;
    };
    return syntaxError.status === 400 && 'body' in syntaxError;
  }

  return Boolean(
    typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      error.type === 'entity.parse.failed'
  );
};

const getStatusCode = (error: unknown): number => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = Number((error as { statusCode?: number }).statusCode);
    if (Number.isInteger(statusCode) && statusCode >= 400) {
      return statusCode;
    }
  }

  if (isBodyParseError(error)) {
    return 400;
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = String((error as { name?: string }).name);
    if (name === 'ValidationError') {
      return 400;
    }
    if (
      ['UnauthorizedError', 'JsonWebTokenError', 'TokenExpiredError'].includes(
        name
      )
    ) {
      return 401;
    }
    if (
      [
        'UserNotFoundError',
        'RefreshTokenNotFoundError',
        'CourseNotFoundError',
      ].includes(name)
    ) {
      return 404;
    }
  }

  return 500;
};

const getClientMessage = (error: unknown, statusCode: number): string => {
  if (isBodyParseError(error)) {
    return 'Invalid JSON payload';
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '');
    if (message && statusCode !== 500) {
      return message;
    }
  }

  if (statusCode === 404) {
    return 'Resource not found';
  }

  if (statusCode === 401) {
    return 'Unauthorized';
  }

  if (statusCode === 400) {
    return 'Bad request';
  }

  return 'Internal server error';
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = getStatusCode(error);
  const message = getClientMessage(error, statusCode);

  logger.error(
    {
      err: error,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    'Request failed'
  );

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
