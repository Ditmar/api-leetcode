import { config } from '@config';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token-repository';
import { RefreshTokenToken } from '../../domain/refresh-token-token';
import { RefreshToken } from '../../domain/refresh-token';
import {
  RefreshTokenNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../../domain/errors/refresh-token-errors';

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

    const user = await this.authRepository.findById(refreshToken.userId);

    if (!user) {
      throw new RefreshTokenNotFoundError('User not found');
    }

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

    // Atomically revoke the old token and create the new one.
    const rotated = await this.refreshTokenRepository.rotate(
      new RefreshTokenToken(refreshTokenValue),
      newRefreshToken
    );

    if (!rotated) {
      throw new RefreshTokenRevokedError();
    }

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
