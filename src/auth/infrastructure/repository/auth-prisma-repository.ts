import { PrismaClient } from '@prisma/client';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUser } from '../../domain/auth-user';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { AuthUserId } from '../../domain/auth-user-id';

export class AuthPrismaRepository implements AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(user: AuthUser): Promise<AuthUser> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        password: user.password.getValue(),
        createdAt: user.createdAt.getValue(),
      },
    });

    return new AuthUser(
      createdUser.id,
      createdUser.name,
      createdUser.email,
      createdUser.password,
      createdUser.createdAt
    );
  }

  async findByEmail(email: AuthUserEmail): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    if (!user) {
      return null;
    }

    return new AuthUser(
      user.id,
      user.name,
      user.email,
      user.password,
      user.createdAt
    );
  }

  async findById(id: AuthUserId): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id.getValue(),
      },
    });

    if (!user) {
      return null;
    }

    return new AuthUser(
      user.id,
      user.name,
      user.email,
      user.password,
      user.createdAt
    );
  }
}