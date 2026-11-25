import type { Submission } from '../entities/submission.entity';

export interface ExecutionWorker {
  process(submission: Submission): Promise<Submission>;
}
