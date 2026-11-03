import { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

/**
 * Closes the client connection if no response has started within `timeoutMs`.
 *
 * - The client receives a connection error, not an HTTP status (callers such as Astro must handle it).
 * - It does NOT cancel the work already running (DB queries, executions) nor its side effects.
 * - A late response from the handler is discarded without throwing, so the process keeps running.
 * - Responses that already started (headers sent) are left untouched.
 */
export const createTimeoutMiddleware =
  (timeoutMs: number, logger: Pick<Logger, 'warn'>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (res.headersSent || req.socket.destroyed) return;
      logger.warn(
        `Request timeout after ${timeoutMs}ms: ${req.method} ${req.originalUrl}`
      );
      req.socket.destroy();
    }, timeoutMs);

    // 'close' fires both when the response finishes and when the connection is closed.
    res.once('close', () => clearTimeout(timer));

    next();
  };
