import type {
  RankingFilters,
  RankingRepository,
} from '../../domain/repositories/ranking.repository';
import {
  RankingService,
  type RankingQueryOptions,
} from '../../domain/services/ranking.service';

export class GetRankingUseCase {
  constructor(
    private repository: RankingRepository,
    private rankingService: RankingService = new RankingService()
  ) {}

  async execute(filters: RankingFilters, options: RankingQueryOptions = {}) {
    await this.repository.validateFilters(filters);
    const rows = await this.repository.getRankingRows(filters);
    return this.rankingService.calculateRanking(rows, options);
  }
}
