import { Contest } from '../../domain/entities/contest.entity';
import { ContestRepository } from '../../domain/repositories/contest.repository';
import { validate as isValidUUID } from 'uuid';

class ContestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContestValidationError';
  }
}

export class GetContestByIdUseCase {
  constructor(private contestRepository: ContestRepository) {}

  async execute(id: string): Promise<Contest | null> {
    if (!isValidUUID(id)) {
      throw new ContestValidationError('Invalid contest ID format');
    }

    return this.contestRepository.getById(id);
  }
}
