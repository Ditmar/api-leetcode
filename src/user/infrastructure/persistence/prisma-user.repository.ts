import { PrismaClient } from '@prisma/client';

import { UserRepository } from '../../../user/domain/repository/user-repository';
import { UserId } from '../../../user/domain/user-id';
import { User } from '../../../user/domain/user';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name.getValue(),
        email: user.email.getValue(),
        password: user.password.getValue(),
      },
    });

    return new User(
      createdUser.id,
      createdUser.name,
      createdUser.email,
      createdUser.password
    );
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(
      user => new User(user.id, user.name, user.email, user.password)
    );
  }

  async getById(userId: UserId): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId.getValue(),
      },
    });

    if (!user) {
      return null;
    }

    return new User(user.id, user.name, user.email, user.password);
  }

  async edit(id: UserId, user: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: id.getValue(),
      },
      data: {
        ...(user.name && { name: user.name.getValue() }),
        ...(user.email && { email: user.email.getValue() }),
        ...(user.password && { password: user.password.getValue() }),
      },
    });

    return new User(
      updatedUser.id,
      updatedUser.name,
      updatedUser.email,
      updatedUser.password
    );
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: id.getValue(),
      },
    });
  }
}
