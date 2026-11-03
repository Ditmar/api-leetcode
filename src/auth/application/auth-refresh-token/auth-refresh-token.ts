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

import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../../domain/refresh-token';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
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
      await this.refreshTokenRepository.revokeAllByUserId(refreshToken.userId);
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
    // Revoke the current refresh token before rotating it.
    await this.refreshTokenRepository.revoke(
      new RefreshTokenToken(refreshTokenValue)
    );

    // Generate a new refresh token.
    const newRefreshTokenValue = uuidv4();

    const newRefreshTokenExpiresAt = new Date(
      Date.now() + config.JWT.refreshTokenExpiresIn
    );

    const newRefreshToken = new RefreshToken(
      uuidv4(),
      newRefreshTokenValue,
      user.id.getValue(),
      newRefreshTokenExpiresAt
    );
    await this.refreshTokenRepository.create(newRefreshToken);

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
      refreshToken: newRefreshTokenValue,
    };
  }
}
