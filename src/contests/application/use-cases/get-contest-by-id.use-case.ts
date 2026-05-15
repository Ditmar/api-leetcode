import { Contest } from '../../domain/entities/contest.entity';
import { ContestRepository } from '../../domain/repositories/contest.repository';

export class GetContestByIdUseCase {
  constructor(private contestRepository: ContestRepository) {}

  async execute(id: string): Promise<Contest | null> {
    if (!this.isValidUUID(id)) {
      throw new Error('Invalid contest ID format');
    }
    return this.contestRepository.getById(id);
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
