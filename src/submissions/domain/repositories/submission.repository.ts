import type { Submission } from '../entities/submission.entity';

export abstract class SubmissionRepository {
  abstract create(submission: Submission): Promise<Submission>;
  abstract findById(id: string): Promise<Submission | null>;
  abstract findByUserId(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<Submission[]>;
  abstract update(submission: Submission): Promise<Submission>;
}
