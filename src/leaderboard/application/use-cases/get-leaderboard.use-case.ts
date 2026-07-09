import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry.entity';
import type {
  LeaderboardFilters,
  LeaderboardRepository,
} from '../../domain/repositories/leaderboard.repository';
import type { LeaderboardCache } from '../../infrastructure/cache/leaderboard-cache';

export interface LeaderboardMetaDto {
  period: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface GetLeaderboardResponseDto {
  data: LeaderboardEntry[];
  meta: LeaderboardMetaDto;
}

export class GetLeaderboardUseCase {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly cache: LeaderboardCache
  ) {}

  async execute(
    filters: LeaderboardFilters
  ): Promise<GetLeaderboardResponseDto> {
    const period = this.normalizePeriod(filters.period);
    const page =
      Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
    const pageSize =
      Number.isInteger(filters.pageSize) && filters.pageSize > 0
        ? Math.min(filters.pageSize, 100)
        : 10;

    const cacheKey = `${period}:${page}:${pageSize}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.leaderboardRepository.getLeaderboard({
      period,
      page,
      pageSize,
    });

    const data = result.data.map((entry, index) => {
      return new LeaderboardEntry(
        (page - 1) * pageSize + index + 1,
        entry.userId,
        entry.name,
        entry.email,
        entry.solvedProblems,
        entry.correctSubmissions
      );
    });

    const response: GetLeaderboardResponseDto = {
      data,
      meta: {
        period,
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    };

    this.cache.set(cacheKey, response);
    return response;
  }

  private normalizePeriod(period: string): 'weekly' | 'monthly' | 'all-time' {
    if (period === 'weekly' || period === 'monthly' || period === 'all-time') {
      return period;
    }

    return 'all-time';
  }
}
