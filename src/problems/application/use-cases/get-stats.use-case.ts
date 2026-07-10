import type { ProblemRepository } from '../../domain/repositories/problem.repository';

export interface ProblemStatsDto {
  total: number;
  solved: number;
  attempted: number;
  unsolved: number;
}

export class GetStatsUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(userId: string): Promise<ProblemStatsDto> {
    const { solved, attempted, total } =
      await this.problemRepository.findStatsByUser(userId);

    return {
      total,
      solved,
      attempted,
      unsolved: total - solved - attempted,
    };
  }
}
