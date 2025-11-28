import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../../share/infrastructure/config';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export class AuthLogin {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<LoginResponse> {
    const user = await this.repository.findByEmail(new AuthUserEmail(email));

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

    //  FIX: Use validated config and explicit algorithm
    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as any,
      algorithm: 'HS256',
    };

    const token = jwt.sign(
      {
        id: user.id.getValue(),
        email: user.email.getValue(),
      },
      config.jwtSecret,
      options
    );

    return {
      token,
      user: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        createdAt: user.createdAt.getValue().toISOString(),
      },
    };
  }
}