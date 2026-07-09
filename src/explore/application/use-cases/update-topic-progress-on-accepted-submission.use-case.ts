import { ProblemRepository } from '../../../problems/domain/repositories/problem.repository';
import { TopicProgressRepository } from '../../domain/repositories/topic-progress-repository';

export class UpdateTopicProgressOnAcceptedSubmissionUseCase {
  constructor(
    private topicProgressRepo: TopicProgressRepository,
    private problemRepo: ProblemRepository // para obtener los topics del problema
  ) {}

  async execute(userId: string, problemId: string): Promise<void> {
    // 1. Obtener los topics asociados al problema
    const topics = await this.problemRepo.findTopicsByProblemId(problemId);
    if (topics.length === 0) return;

    // 2. Para cada topic, calcular el progreso del usuario en ese topic
    for (const topic of topics) {
      // Obtener todos los problemas del topic
      const topicProblems = await this.problemRepo.findProblemIdsByTopicId(
        topic.id
      );
      // Obtener los IDs de problemas que el usuario ha resuelto (estado 'accepted')
      const solvedProblems =
        await this.problemRepo.findSolvedProblemIdsByUserAndTopic(
          userId,
          topic.id
        );

      // Calcular progreso: (solved / total) * 100 (o como porcentaje)
      const total = topicProblems.length;
      const solved = solvedProblems.length;
      const progress = total > 0 ? Math.round((solved / total) * 100) : 0;

      // Upsert el progreso
      await this.topicProgressRepo.upsert(userId, topic.id, progress);
    }
  }
}
