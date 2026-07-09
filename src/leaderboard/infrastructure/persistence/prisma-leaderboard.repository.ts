import type { PrismaClient } from '@prisma/client';
import { LeaderboardEntry } from '../../domain/entities/leaderboard-entry.entity';
import {
  LeaderboardFilters,
  LeaderboardPeriod,
  LeaderboardRepository,
} from '../../domain/repositories/leaderboard.repository';

interface AggregatedLeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  solvedProblems: Set<string>;
  correctSubmissions: number;
}

export class PrismaLeaderboardRepository extends LeaderboardRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async getLeaderboard(filters: LeaderboardFilters) {
    const submissions = await this.prisma.problemSubmission.findMany({
      where: this.buildWhere(filters.period),
      select: {
        userId: true,
        problemId: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const grouped = new Map<string, AggregatedLeaderboardEntry>();

    for (const submission of submissions) {
      const existing = grouped.get(submission.userId) ?? {
        userId: submission.userId,
        name: submission.user?.name ?? 'Unknown',
        email: submission.user?.email ?? '',
        solvedProblems: new Set<string>(),
        correctSubmissions: 0,
      };

      if (submission.status === 'accepted') {
        existing.solvedProblems.add(submission.problemId);
        existing.correctSubmissions += 1;
      }

      grouped.set(submission.userId, existing);
    }

    const rankedUsers = Array.from(grouped.values())
      .map(entry => ({
        ...entry,
        solvedProblems: entry.solvedProblems.size,
      }))
      .sort((left, right) => {
        if (right.solvedProblems !== left.solvedProblems) {
          return right.solvedProblems - left.solvedProblems;
        }

        if (right.correctSubmissions !== left.correctSubmissions) {
          return right.correctSubmissions - left.correctSubmissions;
        }

        return left.name.localeCompare(right.name);
      });

    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = rankedUsers
      .slice(startIndex, startIndex + filters.pageSize)
      .map(
        entry =>
          new LeaderboardEntry(
            0,
            entry.userId,
            entry.name,
            entry.email,
            entry.solvedProblems,
            entry.correctSubmissions
          )
      );

    return {
      data: paginated,
      total: rankedUsers.length,
    };
  }

  private buildWhere(period: LeaderboardPeriod) {
    const now = new Date();
    const startDate =
      period === 'weekly'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : period === 'monthly'
          ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          : null;

    return {
      ...(startDate ? { createdAt: { gte: startDate } } : {}),
    };
  }
}
