import { RefreshToken } from '../refresh-token';
import { RefreshTokenToken } from '../refresh-token-token';
import { AuthUserId } from '../auth-user-id';

export interface RefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: RefreshTokenToken): Promise<RefreshToken | null>;
  findByUserId(userId: AuthUserId): Promise<RefreshToken[]>;
  revoke(token: RefreshTokenToken): Promise<void>;
  revokeAllByUserId(userId: AuthUserId): Promise<void>;
  deleteExpired(): Promise<void>;
}
