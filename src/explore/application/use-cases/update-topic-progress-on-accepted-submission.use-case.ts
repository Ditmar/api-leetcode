import { ProblemRepository } from '../../../problems/domain/repositories/problem.repository';
import { TopicProgressRepository } from '../../domain/repositories/topic-progress.repository';

export class UpdateTopicProgressOnAcceptedSubmissionUseCase {
  constructor(
    private topicProgressRepo: TopicProgressRepository,
    private problemRepo: ProblemRepository
  ) {}

  async execute(userId: string, problemId: string): Promise<void> {
    const topics = await this.problemRepo.findTopicsByProblemId(problemId);
    if (topics.length === 0) return;

    for (const topic of topics) {
      const topicProblems = await this.problemRepo.findProblemIdsByTopicId(
        topic.id
      );
      const solvedProblems =
        await this.problemRepo.findSolvedProblemIdsByUserAndTopic(
          userId,
          topic.id
        );
      const total = topicProblems.length;
      const solved = solvedProblems.length;
      const progress = total > 0 ? Math.round((solved / total) * 100) : 0;

      await this.topicProgressRepo.upsert(userId, topic.id, progress);
    }
  }
}
