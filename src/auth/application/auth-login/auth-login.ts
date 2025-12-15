import { config } from '@config';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token-repository';
import { RefreshToken } from '../../domain/refresh-token';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export class AuthLogin {
  constructor(
    private authRepository: AuthRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(email: string, password: string): Promise<LoginResponse> {
    const user = await this.authRepository.findByEmail(
      new AuthUserEmail(email)
    );

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password.getValue()
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    //  Generate access token
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

    //  Generate refresh token
    const refreshTokenValue = uuidv4();
    const refreshTokenExpiresAt = new Date(
      Date.now() + config.JWT.refreshTokenExpiresIn
    );

    const refreshToken = new RefreshToken(
      uuidv4(),
      refreshTokenValue,
      user.id.getValue(),
      refreshTokenExpiresAt
    );

    await this.refreshTokenRepository.create(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        createdAt: user.createdAt.getValue().toISOString(),
      },
    };
  }
}
