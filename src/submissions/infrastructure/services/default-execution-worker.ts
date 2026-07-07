import { Submission } from '../../domain/entities/submission.entity';
import type { ExecutionWorker } from '../../domain/services/execution-worker';

export class DefaultExecutionWorker implements ExecutionWorker {
  async process(submission: Submission): Promise<Submission> {
    return new Submission(
      submission.id,
      submission.problemId,
      submission.userId,
      submission.language,
      submission.code,
      'accepted',
      42,
      128,
      submission.createdAt
    );
  }
}
