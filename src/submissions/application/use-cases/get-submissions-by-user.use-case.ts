import type { SubmissionRepository } from '../../domain/repositories/submission.repository';
import type { Submission } from '../../domain/entities/submission.entity';

export class GetSubmissionsByUserUseCase {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async execute(userId: string): Promise<Submission[]> {
    return this.submissionRepository.findByUserId(userId);
  }
}
