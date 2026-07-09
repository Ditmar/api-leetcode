import type { LeaderboardEntry } from '../entities/leaderboard-entry.entity';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';

export interface LeaderboardFilters {
  period: LeaderboardPeriod;
  page: number;
  pageSize: number;
}

export interface LeaderboardPage {
  data: LeaderboardEntry[];
  total: number;
}

export abstract class LeaderboardRepository {
  abstract getLeaderboard(
    filters: LeaderboardFilters
  ): Promise<LeaderboardPage>;
}
