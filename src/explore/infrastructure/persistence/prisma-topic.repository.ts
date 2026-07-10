import { PrismaClient } from '@prisma/client';
import {
  ExploreStats,
  GetTopicsFilters,
  TopicRepository,
} from '../../domain/repositories/topic.repository';
import { TopicEntity } from '../../domain/entities/topic.entity';

export class PrismaTopicRepository implements TopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async updateProgressForProblem(
    userId: string,
    problemId: string
  ): Promise<void> {
    const topicProblems = await this.prisma.topicProblem.findMany({
      where: { problemId },
      select: { topicId: true },
    });

    if (topicProblems.length === 0) return;

    const topicIds = topicProblems.map(tp => tp.topicId);

    const acceptedSubmissions = await this.prisma.problemSubmission.findMany({
      where: {
        userId,
        status: 'accepted',
      },
      distinct: ['problemId'],
      select: { problemId: true },
    });
    const solvedProblemIds = acceptedSubmissions.map(s => s.problemId);

    const topicProgressCounts = await this.prisma.topicProblem.groupBy({
      by: ['topicId'],
      where: {
        topicId: { in: topicIds },
        problemId: { in: solvedProblemIds },
      },
      _count: {
        problemId: true,
      },
    });

    const progressMap = new Map<string, number>();
    topicProgressCounts.forEach(item => {
      progressMap.set(item.topicId, item._count.problemId);
    });

    const now = new Date();
    const operations = topicIds.map(topicId => {
      const progress = progressMap.get(topicId) || 0;
      return this.prisma.topicProgress.upsert({
        where: {
          userId_topicId: { userId, topicId },
        },
        update: {
          progress,
          lastActiveAt: now,
        },
        create: {
          userId,
          topicId,
          progress,
          lastActiveAt: now,
        },
      });
    });

    await this.prisma.$transaction(operations);
  }

  async findAll(
    filters: GetTopicsFilters,
    userId?: string
  ): Promise<TopicEntity[]> {
    const topics = await this.prisma.topic.findMany({
      where: {
        isActive: true,
        ...(filters.category && {
          category: filters.category,
        }),
        ...(filters.difficulty && {
          difficulty: filters.difficulty,
        }),
      },
      include: {
        userProgress: userId
          ? {
              where: { userId },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return topics.map(
      topic =>
        new TopicEntity(
          topic.id,
          topic.slug,
          topic.title,
          topic.description,
          topic.category,
          topic.difficulty,
          topic.icon,
          topic.totalProblems,
          topic.userProgress?.[0]?.progress ?? 0
        )
    );
  }

  async findBySlug(slug: string, userId?: string): Promise<TopicEntity | null> {
    const topic = await this.prisma.topic.findUnique({
      where: { slug, isActive: true },
      include: {
        userProgress: userId
          ? {
              where: { userId },
            }
          : false,
      },
    });

    if (!topic) return null;

    return new TopicEntity(
      topic.id,
      topic.slug,
      topic.title,
      topic.description,
      topic.category,
      topic.difficulty,
      topic.icon,
      topic.totalProblems,
      topic.userProgress?.[0]?.progress ?? 0
    );
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.topic.findMany({
      where: {
        isActive: true,
      },
      distinct: ['category'],
      select: {
        category: true,
      },
    });

    return categories.map(({ category }) => category);
  }

  async getStats(userId: string): Promise<ExploreStats> {
    try {
      const [totalTopics, totalProblems, acceptedProblems] = await Promise.all([
        this.prisma.topic.count({
          where: { isActive: true },
        }),

        this.prisma.topic.aggregate({
          where: { isActive: true },
          _sum: {
            totalProblems: true,
          },
        }),

        this.prisma.problemSubmission.findMany({
          where: {
            userId,
            status: 'accepted',
            problem: {
              topicProblems: {
                some: {
                  topic: {
                    isActive: true,
                  },
                },
              },
            },
          },
          distinct: ['problemId'],
          select: {
            problemId: true,
          },
        }),
      ]);

      const solvedProblems = acceptedProblems.length;
      const totalProblemCount = totalProblems._sum.totalProblems ?? 0;
      const overallProgress =
        totalProblemCount > 0
          ? Math.round((solvedProblems / totalProblemCount) * 100)
          : 0;

      return {
        totalTopics,
        solvedProblems,
        overallProgress,
      };
    } catch (error) {
      console.error('[TopicRepository:getStats]', error);
      throw new Error('Failed to retrieve explore statistics.');
    }
  }
}
