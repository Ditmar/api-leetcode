import { PrismaClient } from '@prisma/client';
import { Submission } from '../../domain/entities/submission.entity';
import { SubmissionRepository } from '../../domain/repositories/submission.repository';

export class PrismaSubmissionRepository extends SubmissionRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async create(submission: Submission): Promise<Submission> {
    const raw = await this.prisma.problemSubmission.create({
      data: {
        id: submission.id,
        problemId: submission.problemId,
        userId: submission.userId,
        language: submission.language,
        code: submission.code,
        mode: 'submit',
        status: submission.status,
        runtimeMs: submission.runtime ?? undefined,
        memoryMb: submission.memory ?? undefined,
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

  async findByUserId(userId: string): Promise<Submission[]> {
    const raws = await this.prisma.problemSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(
      (raw: {
        id: string;
        problemId: string;
        userId: string;
        language: string;
        code: string;
        status: string;
        runtimeMs: number | null;
        memoryMb: number | null;
        createdAt: Date;
      }) => this.toDomain(raw)
    );
  }

  async update(submission: Submission): Promise<Submission> {
    const raw = await this.prisma.problemSubmission.update({
      where: { id: submission.id },
      data: {
        status: submission.status,
        runtimeMs: submission.runtime ?? undefined,
        memoryMb: submission.memory ?? undefined,
      },
    });

    return this.toDomain(raw);
  }

  private toDomain(raw: {
    id: string;
    problemId: string;
    userId: string;
    language: string;
    code: string;
    status: string;
    runtimeMs: number | null;
    memoryMb: number | null;
    createdAt: Date;
  }): Submission {
    return new Submission(
      raw.id,
      raw.problemId,
      raw.userId,
      raw.language,
      raw.code,
      raw.status,
      raw.runtimeMs,
      raw.memoryMb,
      raw.createdAt
    );
  }
}
