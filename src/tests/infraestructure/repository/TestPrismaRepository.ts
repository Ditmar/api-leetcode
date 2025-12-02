import { PrismaClient, Prisma } from '@prisma/client';
import {
  TestRepository,
  GetTestsParams,
  GetTestsResult,
  Answer,
  SessionWithRelations,
} from '../../domain/repositories/TestRepository';
import { Test } from '../../domain/entities/Test';
import { TestSession } from '../../domain/entities/TestSession';
import { Submission } from '../../domain/entities/Submission';
import { Question } from '../../domain/entities/Question';

export class TestPrismaRepository implements TestRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(params: GetTestsParams): Promise<GetTestsResult> {
    const skip = (params.page - 1) * params.limit;
    const where: Prisma.TestWhereInput = { isActive: true };

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

    let orderBy: Prisma.TestOrderByWithRelationInput = { createdAt: 'desc' };
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

    const mappedData: Test[] = data.map(test => ({
      id: test.id,
      name: test.name,
      description: test.description,
      companyId: test.companyId,
      difficulty: test.difficulty,
      duration: test.duration,
      isActive: test.isActive,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      company: test.company,
      questions: test.questions,
    }));

    return {
      data: mappedData,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    };
  }

  async getById(id: string): Promise<Test | null> {
    const test = await this.prisma.test.findUnique({
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

    if (!test) return null;

    return {
      id: test.id,
      name: test.name,
      description: test.description,
      companyId: test.companyId,
      difficulty: test.difficulty,
      duration: test.duration,
      isActive: test.isActive,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
      company: test.company,
      questions: test.questions,
    };
  }

  async createSession(
    testId: string,
    userId: string,
    expiresAt: Date
  ): Promise<TestSession> {
    const session = await this.prisma.testSession.create({
      data: {
        testId,
        userId,
        expiresAt,
        isActive: true,
      },
    });

    return {
      id: session.id,
      testId: session.testId,
      userId: session.userId,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
    };
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
      correctAnswer: q.correctAnswer as string[] | null,
      programmingData: q.programmingData as Record<string, unknown> | null,
      order: q.order,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }

  async getSessionById(
    sessionId: string
  ): Promise<SessionWithRelations | null> {
    const session = await this.prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        test: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!session) return null;

    return {
      id: session.id,
      testId: session.testId,
      userId: session.userId,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      test: session.test,
      user: session.user,
    };
  }

  async createSubmission(
    data: Omit<Submission, 'id' | 'submittedAt'>
  ): Promise<Submission> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Submission already exists for this session');
        }
      }
      throw error;
    }
  }

  async saveAnswer(data: {
    sessionId: string;
    questionId: string;
    selectedOption?: string;
    code?: string;
    language?: string;
  }): Promise<Answer> {
    const answer = await this.prisma.answer.create({
      data: {
        sessionId: data.sessionId,
        questionId: data.questionId,
        selectedOption: data.selectedOption,
        code: data.code,
        language: data.language,
      },
      include: {
        question: true,
      },
    });

    return {
      id: answer.id,
      sessionId: answer.sessionId,
      questionId: answer.questionId,
      selectedOption: answer.selectedOption || undefined,
      code: answer.code || undefined,
      language: answer.language || undefined,
      isCorrect: answer.isCorrect || undefined,
      points: answer.points || undefined,
      answeredAt: answer.answeredAt,
    };
  }

  async getAnswersBySessionId(sessionId: string): Promise<Answer[]> {
    const answers = await this.prisma.answer.findMany({
      where: { sessionId },
      include: {
        question: true,
      },
    });

    return answers.map(a => ({
      id: a.id,
      sessionId: a.sessionId,
      questionId: a.questionId,
      selectedOption: a.selectedOption || undefined,
      code: a.code || undefined,
      language: a.language || undefined,
      isCorrect: a.isCorrect || undefined,
      points: a.points || undefined,
      answeredAt: a.answeredAt,
    }));
  }
}
