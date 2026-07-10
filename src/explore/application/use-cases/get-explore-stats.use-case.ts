import { UserRepository } from '../../../user/domain/repository/user-repository';
import { UserId } from '../../../user/domain/user-id';
import { TopicRepository } from '../../domain/repositories/topic.repository';

export class GetExploreStatsUseCase {
  constructor(
    private readonly repository: TopicRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: UserId) {
    const user = await this.userRepository.getById(userId);

    if (!user) {
      throw new Error('Invalid user');
    }

    return this.repository.getStats(userId.toString());
  }
}
