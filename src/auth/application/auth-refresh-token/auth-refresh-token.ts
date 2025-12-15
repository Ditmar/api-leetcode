import { config } from '@config';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token-repository';
import { RefreshTokenToken } from '../../domain/refresh-token-token';
import {
  RefreshTokenNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../domain/errors/refresh-token-errors';

export interface RefreshTokenResponse {
  accessToken: string;
}

export class AuthRefreshToken {
  constructor(
    private authRepository: AuthRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(refreshTokenValue: string): Promise<RefreshTokenResponse> {
    const refreshToken = await this.refreshTokenRepository.findByToken(
      new RefreshTokenToken(refreshTokenValue)
    );

    if (!refreshToken) {
      throw new RefreshTokenNotFoundError();
    }

    if (refreshToken.isRevoked.getValue()) {
      throw new RefreshTokenRevokedError();
    }

    if (refreshToken.expiresAt.isExpired()) {
      throw new RefreshTokenExpiredError();
    }

    // Verify user still exists
    const user = await this.authRepository.findById(refreshToken.userId);

    if (!user) {
      throw new RefreshTokenNotFoundError('User not found');
    }

    // Generate new access token
    const accessTokenOptions: SignOptions = {
      expiresIn: config.JWT.expiresIn,
      algorithm: 'HS256',
    };

    const accessToken = jwt.sign(
      {
        id: user.id.getValue(),
        email: user.email.getValue(),
      },
      config.JWT.secret,
      accessTokenOptions
    );

    return {
      accessToken,
    };
  }
}
