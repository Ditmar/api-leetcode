import { config } from '@config';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import { AuthRepository } from '../../domain/repository/auth-repository';

export interface LoginResponse {
  token: string;
  expiresIn: number;
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

    //  Use validated config and explicit algorithm
    const options: SignOptions = {
      expiresIn: config.JWT.expiresIn as any,
      algorithm: 'HS256',
    };

    const token = jwt.sign(
      {
        id: user.id.getValue(),
        email: user.email.getValue(),
      },
      config.JWT.secret,
      options
    );

    return {
      token,
      expiresIn: options.expiresIn as number,
      user: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        createdAt: user.createdAt.getValue().toISOString(),
      },
    };
  }
}
