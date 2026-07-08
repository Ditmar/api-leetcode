import { PrismaClient } from '@prisma/client';
import type {
  RankingFilters,
  RankingRepository,
  RankingRow,
} from '../../domain/repositories/ranking.repository';

export class PrismaRankingRepository implements RankingRepository {
  constructor(private prisma: PrismaClient) {}

  async validateFilters(filters: RankingFilters): Promise<void> {
    if (filters.testId) {
      const test = await this.prisma.test.findUnique({
        where: { id: filters.testId },
      });
      if (!test) {
        throw new Error('Invalid testId: test not found');
      }
    }

    if (filters.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: filters.courseId },
      });
      if (!course) {
        throw new Error('Invalid courseId: course not found');
      }
    }
  }

  async getRankingRows(filters: RankingFilters): Promise<RankingRow[]> {
    const whereClauses: Array<Record<string, unknown>> = [];

    if (filters.testId) {
      whereClauses.push({ testId: filters.testId });
    }

    if (filters.startDate || filters.endDate) {
      whereClauses.push({
        submittedAt: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {}),
        },
      });
    }

    const allowedUserIds = filters.courseId
      ? (
          await this.prisma.enrollment.findMany({
            where: { courseId: filters.courseId },
            select: { userId: true },
          })
        ).map((enrollment: { userId: string }) => enrollment.userId)
      : undefined;

    const submissions = await this.prisma.submission.findMany({
      where: {
        AND: [
          ...whereClauses,
          ...(allowedUserIds && allowedUserIds.length > 0
            ? [{ userId: { in: allowedUserIds } }]
            : []),
        ],
      },
      select: {
        userId: true,
        score: true,
        submittedAt: true,
        breakdown: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const aggregation = new Map<string, RankingRow>();

    for (const submission of submissions) {
      const row = aggregation.get(submission.userId) ?? {
        userId: submission.userId,
        userName: submission.user.name,
        avatar: null,
        totalPoints: 0,
        submissions: 0,
        correctAnswers: 0,
        averageScore: 0,
      };

      const breakdown = Array.isArray(submission.breakdown)
        ? submission.breakdown
        : [];
      let correctAnswers = 0;
      for (const item of breakdown as Array<unknown>) {
        const entry = item as { details?: Array<{ correct?: boolean }> };
        if (entry?.details) {
          correctAnswers += entry.details.filter(
            detail => detail.correct
          ).length;
        }
      }

      row.totalPoints += Number(submission.score);
      row.submissions += 1;
      row.correctAnswers += correctAnswers;
      row.averageScore =
        row.submissions > 0 ? row.totalPoints / row.submissions : 0;
      aggregation.set(submission.userId, row);
    }

    return Array.from(aggregation.values());
  }
}
