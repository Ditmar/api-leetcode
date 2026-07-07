import { v4 as uuidv4 } from 'uuid';
import { Submission } from '../../domain/entities/submission.entity';
import type { ExecutionWorker } from '../../domain/services/execution-worker';
import type { SubmissionRepository } from '../../domain/repositories/submission.repository';
import type { CreateSubmissionDto } from '../dtos/create-submission.dto';

export class CreateSubmissionUseCase {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly executionWorker: ExecutionWorker
  ) {}

  async execute(dto: CreateSubmissionDto): Promise<Submission> {
    const submission = new Submission(
      uuidv4(),
      dto.problemId,
      dto.userId ?? '',
      dto.language,
      dto.code,
      'pending',
      null,
      null,
      new Date()
    );

    const created = await this.submissionRepository.create(submission);
    return this.submissionRepository.update(
      await this.executionWorker.process(created)
    );
  }
}
