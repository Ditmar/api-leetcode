import type { RankingRow } from '../repositories/ranking.repository';

export interface RankingQueryOptions {
  sort?: 'points' | 'submissions' | 'average';
  limit?: number;
  offset?: number;
}

export interface RankingPagination {
  total: number;
  limit: number;
  offset: number;
}

export interface RankingItem {
  position: number;
  userId: string;
  userName: string;
  avatar: string | null;
  totalPoints: number;
  submissions: number;
  correctAnswers: number;
  averageScore: number;
}

export interface RankingResult {
  items: RankingItem[];
  pagination: RankingPagination;
}

export class RankingService {
  calculateRanking(
    rows: RankingRow[],
    options: RankingQueryOptions = {}
  ): RankingResult {
    const limit = Math.max(1, options.limit ?? 10);
    const offset = Math.max(0, options.offset ?? 0);
    const sort = options.sort ?? 'points';

    const sorted = [...rows].sort((a, b) => {
      if (sort === 'submissions') {
        if (b.submissions !== a.submissions) {
          return b.submissions - a.submissions;
        }
      } else if (sort === 'average') {
        if (b.averageScore !== a.averageScore) {
          return b.averageScore - a.averageScore;
        }
      } else {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
      }

      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      return a.userName.localeCompare(b.userName);
    });

    const paged = sorted.slice(offset, offset + limit);

    return {
      items: paged.map((row, index) => ({
        position: offset + index + 1,
        userId: row.userId,
        userName: row.userName,
        avatar: row.avatar,
        totalPoints: row.totalPoints,
        submissions: row.submissions,
        correctAnswers: row.correctAnswers,
        averageScore: row.averageScore,
      })),
      pagination: {
        total: rows.length,
        limit,
        offset,
      },
    };
  }
}
