import { RefreshToken } from '../../../src/auth/domain/refresh-token';
import { RefreshTokenToken } from '../../../src/auth/domain/refresh-token-token';
import { AuthUserId } from '../../../src/auth/domain/auth-user-id';
import { RefreshTokenRepository } from '../../../src/auth/domain/repository/refresh-token-repository';

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public tokens: RefreshToken[] = [];

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    this.tokens.push(refreshToken);
    return refreshToken;
  }

  async findByToken(token: RefreshTokenToken): Promise<RefreshToken | null> {
    const found = this.tokens.find(
      t => t.token.getValue() === token.getValue()
    );
    return found ?? null;
  }

  async findByUserId(userId: AuthUserId): Promise<RefreshToken[]> {
    return this.tokens.filter(t => t.userId.getValue() === userId.getValue());
  }

  async revoke(token: RefreshTokenToken): Promise<void> {
    const found = await this.findByToken(token);
    found?.revoke();
  }

  async revokeAllByUserId(userId: AuthUserId): Promise<void> {
    this.tokens
      .filter(t => t.userId.getValue() === userId.getValue())
      .forEach(t => t.revoke());
  }

  async deleteExpired(): Promise<void> {
    this.tokens = this.tokens.filter(t => !t.expiresAt.isExpired());
  }
}