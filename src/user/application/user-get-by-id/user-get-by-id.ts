import { UserNotFoundError } from '../../domain/errors/user-not-found-error';
import { UserRepository } from '../../domain/repository/user-repository';
import { User } from '../../domain/user';
import { UserId } from '../../domain/user-id';

export class UserGetById {
  constructor(private repository: UserRepository) {}

  async execute(id: string | undefined): Promise<User> {
    if (!id) {
      throw new UserNotFoundError('User not found');
    }
    const userId = new UserId(id);
    const user = await this.repository.getById(userId);
    if (!user) {
      throw new UserNotFoundError('User not found');
    }
    return user;
  }
}
