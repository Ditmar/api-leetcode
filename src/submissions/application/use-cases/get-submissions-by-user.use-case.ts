import type { SubmissionRepository } from '../../domain/repositories/submission.repository';
import type { Submission } from '../../domain/entities/submission.entity';

export class GetSubmissionsByUserUseCase {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async execute(userId: string, page = 1, limit = 20): Promise<Submission[]> {
    return this.submissionRepository.findByUserId(userId, page, limit);
  }
}
