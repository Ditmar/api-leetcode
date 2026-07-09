import { TopicRepository } from '../../domain/repositories/topic.repository';

export class UpdateTopicProgressOnAcceptedUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(userId: string, problemId: string): Promise<void> {
    await this.topicRepository.updateProgressForProblem(userId, problemId);
  }
}
