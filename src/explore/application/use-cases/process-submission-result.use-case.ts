import { ExecutionResult } from '../../domain/entities/execution-result.entity';
import { ProblemSubmissionRepository } from '../../domain/repositories/problem-submission.repository';
import { UpdateTopicProgressOnAcceptedUseCase } from './update-topic-progress-on-accepted.use-case';

export class ProcessSubmissionResultUseCase {
  constructor(
    private readonly submissionRepo: ProblemSubmissionRepository,
    private readonly updateTopicProgressUseCase: UpdateTopicProgressOnAcceptedUseCase
  ) {}

  async execute(
    submissionId: string,
    executionResult: ExecutionResult
  ): Promise<void> {
    const submission = await this.submissionRepo.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const previousStatus = submission.status;
    submission.status = executionResult.status;
    submission.runtimeMs = executionResult.runtimeMs;
    submission.memoryMb = executionResult.memoryMb;
    submission.score = executionResult.score;

    await this.submissionRepo.save(submission);

    if (submission.status === 'accepted' && previousStatus !== 'accepted') {
      await this.updateTopicProgressUseCase.execute(
        submission.userId,
        submission.problemId
      );
    }
  }
}
