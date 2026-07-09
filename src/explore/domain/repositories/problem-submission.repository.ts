import { ProblemSubmission } from '../entities/problem-submission.entity';

export interface ProblemSubmissionRepository {
  findById(id: string): Promise<ProblemSubmission | null>;
  save(submission: ProblemSubmission): Promise<void>;
}
