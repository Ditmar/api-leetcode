import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';
import { UserId } from '../../domain/user-id';
import { PrismaClient } from '@prisma/client';

export class UserRepositoryPostgres implements UserRepository {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }
  create(user: User): Promise<User> {
    return this.prisma.user.create({ data: user });
  }
  getAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  getById(id: UserId): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: id.getValue() } });
  }
  delete(id: UserId): Promise<void> {
    this.prisma.user.delete({ where: { id: id.getValue() } });
    return Promise.resolve();
  }
  edit(id: UserId, user: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id: id.getValue() },
      data: user,
    });
  }
}
