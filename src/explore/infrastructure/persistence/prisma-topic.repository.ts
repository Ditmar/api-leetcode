import { PrismaClient } from '@prisma/client';
import {
  ExploreStats,
  GetTopicsFilters,
  TopicRepository,
} from '../../domain/repositories/topic.repository';
import { TopicEntity } from '../../domain/entities/topic.entity';

export class PrismaTopicRepository implements TopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
      where: { slug },
      include: {
        topicProblems: {
          include: { problem: true },
          orderBy: { order: 'asc' },
        },
        userProgress: userId ? { where: { userId } } : false,
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
      const totalTopics = await this.prisma.topic.count({
        where: { isActive: true },
      });

      const progress = await this.prisma.topicProgress.findMany({
        where: { userId },
      });

      const solvedProblems = progress.reduce(
        (acc, item) => acc + item.progress,
        0
      );

      const totalProblems = await this.prisma.topic.aggregate({
        _sum: {
          totalProblems: true,
        },
      });

      const overallProgress =
        totalProblems._sum.totalProblems && totalProblems._sum.totalProblems > 0
          ? Math.round(
              (solvedProblems / totalProblems._sum.totalProblems) * 100
            )
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
