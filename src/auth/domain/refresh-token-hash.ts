import { createHash } from 'crypto';

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
