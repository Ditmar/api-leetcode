import { PrismaClient } from '@prisma/client';
import { RefreshTokenRepository } from '../../domain/repository/refresh-token-repository';
import { RefreshToken } from '../../domain/refresh-token';
import { RefreshTokenToken } from '../../domain/refresh-token-token';
import { AuthUserId } from '../../domain/auth-user-id';
import { hashRefreshToken } from '../../domain/refresh-token-hash';

export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    await this.prisma.refreshToken.create({
      data: {
        id: refreshToken.id.getValue(),
        token: hashRefreshToken(refreshToken.token.getValue()),
        userId: refreshToken.userId.getValue(),
        expiresAt: refreshToken.expiresAt.getValue(),
        createdAt: refreshToken.createdAt.getValue(),
        isRevoked: refreshToken.isRevoked.getValue(),
      },
    });
    return refreshToken;
  }

  async findByToken(token: RefreshTokenToken): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        token: hashRefreshToken(token.getValue()),
      },
    });

    if (!refreshToken) {
      return null;
    }

    return new RefreshToken(
      refreshToken.id,
      refreshToken.token,
      refreshToken.userId,
      refreshToken.expiresAt,
      refreshToken.createdAt,
      refreshToken.isRevoked
    );
  }

  async findByUserId(userId: AuthUserId): Promise<RefreshToken[]> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: userId.getValue(),
        isRevoked: false,
      },
    });

    return tokens.map(
      (token: {
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
        createdAt: Date;
        isRevoked: boolean;
      }) =>
        new RefreshToken(
          token.id,
          token.token,
          token.userId,
          token.expiresAt,
          token.createdAt,
          token.isRevoked
        )
    );
  }

  async revoke(token: RefreshTokenToken): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        token: hashRefreshToken(token.getValue()),
      },
      data: {
        isRevoked: true,
      },
    });
  }

  async revokeAllByUserId(userId: AuthUserId): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId.getValue(),
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
