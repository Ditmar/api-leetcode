import { UserRepository } from '../../domain/repository/user.repository';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '@config';

export class UserPrismaRepository implements UserRepository {
  async register(
    username: string,
    email: string,
    hashedPassword: string
  ): Promise<void> {
    await PrismaClient.user.create({
      data: { username, email, passwordHash: hashedPassword },
    });
  }
  async findByEmail(email: string) {
    return PrismaClient.user.findUnique({ where: { email } });
  }
  async findByUsername(username: string) {
    return PrismaClient.user.findUnique({ where: { username } });
  }
  async issueToken(user: {
    id: number;
    username: string;
    email: string;
  }): Promise<string> {
    return jwt.sign(
      {
        sub: user.id,
        username: user.username,
        email: user.email,
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );
  }
}
