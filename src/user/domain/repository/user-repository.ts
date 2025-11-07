import { User } from '../user';
import { UserId } from '../user-id';

export interface UserRepository {
  create(user: User): Promise<User>;
  getAll(): Promise<User[]>;
  getById(id: UserId): Promise<User | null>;
  delete(id: UserId): Promise<void>;
  edit(id: UserId, user: Partial<User>): Promise<User>;
}
