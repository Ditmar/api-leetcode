import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUser } from '../../domain/auth-user';
import { AuthUserEmail } from '../../domain/auth-user-email';
import { AuthUserId } from '../../domain/auth-user-id';

export class AuthMockRepository implements AuthRepository {
  private users: AuthUser[] = [];

  async create(user: AuthUser): Promise<AuthUser> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: AuthUserEmail): Promise<AuthUser | null> {
    const user = this.users.find(u => u.email.getValue() === email.getValue());
    return user ?? null;
  }

  async findById(id: AuthUserId): Promise<AuthUser | null> {
    const user = this.users.find(u => u.id.getValue() === id.getValue());
    return user ?? null;
  }
}
