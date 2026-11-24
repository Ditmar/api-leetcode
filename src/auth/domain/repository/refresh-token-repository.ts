import { RefreshToken } from '../refresh-token';
import { RefreshTokenToken } from '../refresh-token-token';
import { AuthUserId } from '../auth-user-id';

export interface RefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByToken(token: RefreshTokenToken): Promise<RefreshToken | null>;
  findByUserId(userId: AuthUserId): Promise<RefreshToken[]>;
  revoke(token: RefreshTokenToken): Promise<void>;
  revokeIfActive(token: RefreshTokenToken): Promise<boolean>;
  revokeAllByUserId(userId: AuthUserId): Promise<void>;
  rotate(
    oldToken: RefreshTokenToken,
    newRefreshToken: RefreshToken
  ): Promise<boolean>;
  deleteExpired(): Promise<void>;
}
