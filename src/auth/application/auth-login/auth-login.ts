import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { InvalidCredentialsError } from '../../domain/errors/auth-errors';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

    const options: SignOptions = {
      expiresIn: /^\d+$/.test(expiresIn) ? Number(expiresIn) : (expiresIn as unknown as any),
    };

    const token = jwt.sign(
      {
        id: user.id.getValue(),
        email: user.email.getValue(),
      },
      secret,
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