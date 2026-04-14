import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';
import { UserCreateAt } from '../../domain/user-create-at';
import { UserId } from '../../domain/user-id';

export class UserPrismaRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(record: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }): User {
    const user = new User(record.id, record.name, record.email);
    user.createdAt = new UserCreateAt(record.createdAt);
    return user;
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id.getValue(),
        name: user.name.getValue(),
        email: user.email.getValue(),
        password: '',
        createdAt: user.createdAt.getValue(),
      },
    });
    return this.toDomain(created);
  }

  async getAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany();
    return records.map(r => this.toDomain(r));
  }

  async getById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({ where: { id: id.getValue() } });
  }

  async edit(id: UserId, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: id.getValue() },
      data: {
        ...(data.name !== undefined && { name: data.name.getValue() }),
        ...(data.email !== undefined && { email: data.email.getValue() }),
      },
    });
    return this.toDomain(updated);
  }
}
