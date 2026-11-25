import type { SubmissionRepository } from '../../domain/repositories/submission.repository';
import type { Submission } from '../../domain/entities/submission.entity';

export class GetSubmissionByIdUseCase {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async execute(id: string): Promise<Submission | null> {
    return this.submissionRepository.findById(id);
  }
}
