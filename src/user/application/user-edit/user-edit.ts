import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';
import { UserId } from '../../domain/user-id';

export class UserEdit {
  constructor(private repository: UserRepository) {}

  async execute(id: string | undefined, data: Partial<User>): Promise<User> {
    if (!id) {
      throw new Error('User not found');
    }
    const userId = new UserId(id);
    const user = await this.repository.edit(userId, data);
    return user;
  }
}
