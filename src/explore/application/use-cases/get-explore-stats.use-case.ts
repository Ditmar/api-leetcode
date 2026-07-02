import { TopicRepository } from '../../domain/repositories/topic.repository';

export class GetExploreStatsUseCase {
  constructor(private readonly repository: TopicRepository) {}

  async execute(userId: string) {
    return this.repository.getStats(userId);
  }
}
