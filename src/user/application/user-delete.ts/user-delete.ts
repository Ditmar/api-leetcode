import { UserRepository } from '../../domain/repository/user-repository';
import { UserId } from '../../domain/user-id';

export class UserDelete {
  constructor(private repository: UserRepository) {}

  async execute(id: string | undefined): Promise<void> {
    if (!id) {
      throw new Error('User not found');
    }
    const userId = new UserId(id);
    await this.repository.delete(userId);
  }
}
