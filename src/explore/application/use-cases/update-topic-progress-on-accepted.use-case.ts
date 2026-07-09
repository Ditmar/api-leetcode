import { TopicRepository } from '../../domain/repositories/topic.repository';

export class UpdateTopicProgressOnAcceptedUseCase {
  constructor(private readonly topicRepository: TopicRepository) {}

  async execute(userId: string, problemId: string): Promise<void> {
    // Simplemente delegamos en el repositorio
    await this.topicRepository.updateProgressForProblem(userId, problemId);
  }
}
