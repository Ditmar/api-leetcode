import {
  ContestRepository,
  ContestStats,
} from '../../domain/repositories/contest.repository';

export class GetContestStatsUseCase {
  constructor(private contestRepository: ContestRepository) {}

  async execute(): Promise<ContestStats> {
    return this.contestRepository.getStats();
  }
}
