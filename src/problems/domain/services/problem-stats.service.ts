import type { Problem } from '../entities/problem.entity';

export class ProblemStatsService {
  incrementSubmissionCount(problem: Problem): { submissionCount: number } {
    return {
      submissionCount: problem.submissionCount + 1,
    };
  }

  incrementAcceptedCount(problem: Problem): {
    acceptedCount: number;
    submissionCount: number;
  } {
    return {
      acceptedCount: problem.acceptedCount + 1,
      submissionCount: problem.submissionCount + 1,
    };
  }

  calculateAcceptanceRate(
    acceptedCount: number,
    submissionCount: number
  ): number {
    if (submissionCount === 0) return 0;
    return (acceptedCount / submissionCount) * 100;
  }
}
