import { AuthRepository } from 'auth/domain/repository/auth-repository';
import { PrismaClient } from '@prisma';
import jwt from 'jsonwebtoken';
export class AuthJSONRepository implements AuthRepository {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }
  register(username: string, password: string, email: string): Promise<string> {
    this.prisma.auth.create({
      data: {
        nickname: username,
        password: password,
        email: email,
      },
    });
    return Promise.resolve('User registered successfully');
  }
  login(username: string, password: string): Promise<string> {
    const user = this.prisma.auth.findUnique({
      where: {
        nickname: username,
        password: password,
      },
    });
    if (user === null) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ username: username }, 'secretKey', {
      expiresIn: '1h',
    });
    return Promise.resolve(token);
  }
}
