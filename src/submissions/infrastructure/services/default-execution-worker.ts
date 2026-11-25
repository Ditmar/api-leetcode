import {
  Submission,
  type SubmissionStatus,
} from '../../domain/entities/submission.entity';
import type { ExecutionWorker } from '../../domain/services/execution-worker';

const DEFAULT_SUBMISSION_STATUS: SubmissionStatus = 'accepted';
const DEFAULT_RUNTIME_MS = 42;
const DEFAULT_MEMORY_MB = 128;

export class DefaultExecutionWorker implements ExecutionWorker {
  async process(submission: Submission): Promise<Submission> {
    const normalizedCode = submission.getCode().trim();

    if (!normalizedCode) {
      return new Submission(
        submission.getId(),
        submission.getProblemId(),
        submission.getUserId(),
        submission.getLanguage(),
        submission.getCode(),
        'rejected',
        null,
        null,
        submission.getCreatedAt()
      );
    }

    // Temporary stub while the execution engine is not wired up.
    return new Submission(
      submission.getId(),
      submission.getProblemId(),
      submission.getUserId(),
      submission.getLanguage(),
      submission.getCode(),
      DEFAULT_SUBMISSION_STATUS,
      DEFAULT_RUNTIME_MS,
      DEFAULT_MEMORY_MB,
      submission.getCreatedAt()
    );
  }
}
