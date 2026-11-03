import rateLimit from 'express-rate-limit';
// Relative import (not '@config') so Jest can resolve it without path mapping.
import { config } from '../../../config/config';

const { rateLimitWindowMs, rateLimitMax, authRateLimitMax } = config.security;

// Counts per client IP (req.ip), which depends on the 'trust proxy' setting.
const createRateLimiter = (limit: number) =>
  rateLimit({
    windowMs: rateLimitWindowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

export const globalLimiter = createRateLimiter(rateLimitMax);

// Stricter limits for auth routes; each route keeps its own counter.
export const loginLimiter = createRateLimiter(authRateLimitMax);
export const signupLimiter = createRateLimiter(authRateLimitMax);
export const refreshLimiter = createRateLimiter(authRateLimitMax);
