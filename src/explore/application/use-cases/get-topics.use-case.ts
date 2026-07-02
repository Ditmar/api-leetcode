import { TopicRepository } from '../../domain/repositories/topic.repository';
import { GetTopicsDto } from '../dtos/get-topics.dto';

export class GetTopicsUseCase {
  constructor(private readonly repository: TopicRepository) {}

  async execute(dto: GetTopicsDto, userId?: string) {
    return this.repository.findAll(dto, userId);
  }
}
