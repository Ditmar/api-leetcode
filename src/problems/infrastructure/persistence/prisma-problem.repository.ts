import type { PrismaClient } from '@prisma/client';
import type {
  ProblemFilters,
  TopicInfo,
} from '../../domain/repositories/problem.repository';
import { ProblemRepository } from '../../domain/repositories/problem.repository';
import {
  Problem,
  TestCase,
  StarterCode,
} from '../../domain/entities/problem.entity';

export class PrismaProblemRepository extends ProblemRepository {
  override findTopicsByProblemId(): Promise<TopicInfo[]> {
    throw new Error('Method not implemented.');
  }
  override findProblemIdsByTopicId(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  override findSolvedProblemIdsByUserAndTopic(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  override updateUserProgress?(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  private mapToDomain(raw: any): Problem {
    const testCases = (raw.testCases ?? []).map(
      (tc: any) =>
        new TestCase(
          tc.id,
          tc.problemId,
          tc.input,
          tc.expectedOutput,
          tc.explanation ?? null,
          tc.isExample,
          tc.order
        )
    );

    const starterCodes = (raw.starterCodes ?? []).map(
      (sc: any) => new StarterCode(sc.id, sc.problemId, sc.language, sc.code)
    );

    return new Problem(
      raw.id,
      raw.slug,
      raw.title,
      raw.description,
      raw.difficulty,
      raw.tags,
      raw.constraints,
      raw.isActive,
      raw.acceptedCount,
      raw.submissionCount,
      testCases,
      starterCodes
    );
  }

  async findMany(
    filters: ProblemFilters
  ): Promise<{ problems: Problem[]; total: number }> {
    const { search, difficulty, tag } = filters;

    const page =
      Number.isInteger(filters.page) && filters.page > 0 ? filters.page : 1;
    const pageSize =
      Number.isInteger(filters.pageSize) && filters.pageSize > 0
        ? Math.min(filters.pageSize, 100)
        : 20;

    const where: any = { isActive: true };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (tag) {
      where.tags = { has: tag };
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.problem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.problem.count({ where }),
    ]);

    return {
      problems: records.map((r: any) => this.mapToDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Problem | null> {
    const record = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        testCases: { where: { isExample: true }, orderBy: { order: 'asc' } },
        starterCodes: true,
      },
    });

    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const record = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: { where: { isExample: true }, orderBy: { order: 'asc' } },
        starterCodes: true,
      },
    });

    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findAllTags(): Promise<string[]> {
    const problems = await this.prisma.problem.findMany({
      where: { isActive: true },
      select: { tags: true },
    });

    const allTags = problems.flatMap((p: any) => p.tags as string[]);
    return [...new Set(allTags)].sort() as string[];
  }

  async findStatsByUser(userId: string): Promise<{
    solved: number;
    attempted: number;
    total: number;
  }> {
    const total = await this.prisma.problem.count({
      where: { isActive: true },
    });

    const solved = await this.prisma.problemSubmission.count({
      where: { userId, status: 'accepted' },
    });

    const attempted = await this.prisma.problemSubmission.count({
      where: {
        userId,
        status: { not: 'accepted' },
        problem: { isActive: true },
      },
    });

    return { total, solved, attempted };
  }

  async save(problem: Problem): Promise<Problem> {
    try {
      const record = await this.prisma.problem.create({
        data: {
          id: problem.id,
          slug: problem.slug,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
          constraints: problem.constraints,
          isActive: problem.isActive,
          acceptedCount: problem.acceptedCount,
          submissionCount: problem.submissionCount,
          testCases: {
            create: problem.testCases.map(tc => ({
              id: tc.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              explanation: tc.explanation,
              isExample: tc.isExample,
              order: tc.order,
            })),
          },
          starterCodes: {
            create: problem.starterCodes.map(sc => ({
              id: sc.id,
              language: sc.language,
              code: sc.code,
            })),
          },
        },
        include: {
          testCases: true,
          starterCodes: true,
        },
      });

      return this.mapToDomain(record);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save problem: ${error.message}`);
      }
      throw new Error('Failed to save problem: unknown error');
    }
  }

  async update(id: string, data: Partial<Problem>): Promise<Problem> {
    const record = await this.prisma.problem.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.constraints !== undefined && {
          constraints: data.constraints,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        testCases: { where: { isExample: true }, orderBy: { order: 'asc' } },
        starterCodes: true,
      },
    });

    return this.mapToDomain(record);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.problem.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
