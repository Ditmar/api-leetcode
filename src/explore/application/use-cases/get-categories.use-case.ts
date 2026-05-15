import { TopicRepository } from '../../domain/repositories/topic.repository';

export class GetCategoriesUseCase {
  constructor(private readonly repository: TopicRepository) {}

  async execute() {
    return this.repository.getCategories();
  }
}
