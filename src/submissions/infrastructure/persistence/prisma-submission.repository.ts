import {
  PrismaClient,
  type ProblemSubmission as PrismaProblemSubmission,
} from '@prisma/client';
import {
  Submission,
  type SubmissionStatus,
} from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../domain/repositories/submission.repository';

export class PrismaSubmissionRepository extends SubmissionRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async create(submission: Submission): Promise<Submission> {
    const raw = await this.prisma.problemSubmission.create({
      data: {
        id: submission.getId(),
        problemId: submission.getProblemId(),
        userId: submission.getUserId(),
        language: submission.getLanguage(),
        code: submission.getCode(),
        mode: 'submit',
        status: submission.getStatus(),
        runtimeMs: submission.getRuntime() ?? undefined,
        memoryMb: submission.getMemory() ?? undefined,
      },
    });

    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Submission | null> {
    const raw = await this.prisma.problemSubmission.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<Submission[]> {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const raws = await this.prisma.problemSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    });
    return raws.map(raw => this.toDomain(raw));
  }

  async update(submission: Submission): Promise<Submission> {
    const raw = await this.prisma.problemSubmission.update({
      where: { id: submission.getId() },
      data: {
        status: submission.getStatus(),
        runtimeMs: submission.getRuntime() ?? undefined,
        memoryMb: submission.getMemory() ?? undefined,
      },
    });

    return this.toDomain(raw);
  }

  private toDomain(raw: PrismaProblemSubmission): Submission {
    return new Submission(
      raw.id,
      raw.problemId,
      raw.userId,
      raw.language,
      raw.code,
      raw.status as SubmissionStatus,
      raw.runtimeMs,
      raw.memoryMb,
      raw.createdAt
    );
  }
}
