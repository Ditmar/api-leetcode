import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';

export class UserGetAll {
  constructor(private repository: UserRepository) {}

  async execute(): Promise<User[]> {
    const users = await this.repository.getAll();
    return users;
  }
}
