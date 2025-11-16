import { PrismaClient } from '@prisma/client';
import {
  TestRepository,
  GetTestsParams,
  GetTestsResult,
} from '../../domain/repositories/TestRepository';
import { TestSession } from '../../domain/entities/TestSession';
import { Submission } from '../../domain/entities/Submission';
import { Question } from '../../domain/entities/Question';

export class TestPrismaRepository implements TestRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(params: GetTestsParams): Promise<GetTestsResult> {
    const skip = (params.page - 1) * params.limit;
    const where: Record<string, unknown> = { isActive: true };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.companyId) {
      where.companyId = params.companyId;
    }

    if (params.difficulty) {
      where.difficulty = params.difficulty;
    }

    let orderBy: Record<string, unknown> = { createdAt: 'desc' };
    if (params.orderBy) {
      switch (params.orderBy) {
        case 'name':
          orderBy = { name: 'asc' };
          break;
        case 'difficulty':
          orderBy = { difficulty: 'asc' };
          break;
        case 'duration':
          orderBy = { duration: 'asc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        skip,
        take: params.limit,
        orderBy,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          questions: {
            select: {
              id: true,
              type: true,
              difficulty: true,
            },
          },
        },
      }),
      this.prisma.test.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    };
  }

  async getById(id: string) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        questions: {
          select: {
            id: true,
            type: true,
            difficulty: true,
            points: true,
          },
        },
      },
    });
  }

  async createSession(
    testId: string,
    userId: string,
    expiresAt: Date
  ): Promise<TestSession> {
    return this.prisma.testSession.create({
      data: {
        testId,
        userId,
        expiresAt,
        isActive: true,
      },
    });
  }

  async getQuestionsByTestId(testId: string): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: { testId },
      orderBy: { order: 'asc' },
    });

    return questions.map(q => ({
      id: q.id,
      testId: q.testId,
      type: q.type as 'MCQ' | 'PROGRAMMING',
      text: q.text,
      difficulty: q.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      points: q.points,
      timeLimit: q.timeLimit,
      options: q.options as Record<string, unknown> | null,
      programmingData: q.programmingData as Record<string, unknown> | null,
      order: q.order,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }

  async getSessionById(sessionId: string) {
    return this.prisma.testSession.findUnique({
      where: { id: sessionId },
    });
  }

  async createSubmission(
    data: Omit<Submission, 'id' | 'submittedAt'>
  ): Promise<Submission> {
    const created = await this.prisma.submission.create({
      data: {
        testId: data.testId,
        sessionId: data.sessionId,
        userId: data.userId,
        score: data.score,
        maxScore: data.maxScore,
        breakdown: JSON.parse(JSON.stringify(data.breakdown)),
      },
    });

    return {
      id: created.id,
      testId: created.testId,
      sessionId: created.sessionId,
      userId: created.userId,
      score: created.score,
      maxScore: created.maxScore,
      breakdown: created.breakdown as unknown as Record<string, unknown>[],
      submittedAt: created.submittedAt,
    };
  }
}
