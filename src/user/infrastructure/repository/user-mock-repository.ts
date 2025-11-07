import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';
import { UserId } from '../../domain/user-id';

export class UserMockRepository implements UserRepository {
  private users: User[] = [];

  create(user: User): Promise<User> {
    this.users.push(user);
    return Promise.resolve(user);
  }
  getAll(): Promise<User[]> {
    const users = this.users;
    return Promise.resolve(users);
  }
  getById(id: UserId): Promise<User | null> {
    const user = this.users.find(user => user.id.getValue() === id.getValue());
    return Promise.resolve(user || null);
  }
  delete(id: UserId): Promise<void> {
    this.users = this.users.filter(
      user => user.id.getValue() !== id.getValue()
    );
    return Promise.resolve();
  }
  edit(id: UserId, user: Partial<User>): Promise<User> {
    const findUser = this.users.find(
      user => user.id.getValue() === id.getValue()
    );
    if (findUser === undefined) {
      throw new Error('User not found');
    }
    if (user === undefined) {
      throw new Error('No data provided for update');
    }
    if (user.email !== undefined) {
      findUser.setEmail(user.email);
    }
    if (user.name !== undefined) {
      findUser.setName(user.name);
    }
    return Promise.resolve(findUser);
  }
}
