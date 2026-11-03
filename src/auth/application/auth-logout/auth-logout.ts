import { RefreshTokenRepository } from '../../domain/repository/refresh-token-repository';
import { RefreshTokenToken } from '../../domain/refresh-token-token';
import { RefreshTokenNotFoundError } from '../../domain/errors/refresh-token-errors';
import { AuthUserId } from '../../domain/auth-user-id';

export class AuthLogout {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async execute(refreshTokenValue: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByToken(
      new RefreshTokenToken(refreshTokenValue)
    );

    if (!refreshToken) {
      throw new RefreshTokenNotFoundError();
    }

    await this.refreshTokenRepository.revoke(
      new RefreshTokenToken(refreshTokenValue)
    );
  }

  async executeAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(new AuthUserId(userId));
  }
}
