import { TopicRepository } from '../../domain/repositories/topic.repository';

export class GetTopicBySlugUseCase {
  constructor(private readonly repository: TopicRepository) {}

  async execute(slug: string, userId?: string) {
    return this.repository.findBySlug(slug, userId);
  }
}
