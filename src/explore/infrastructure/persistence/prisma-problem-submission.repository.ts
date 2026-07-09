import { PrismaClient } from '@prisma/client';
import { ProblemSubmission } from '../../domain/entities/problem-submission.entity';
import { ProblemSubmissionRepository } from '../../domain/repositories/problem-submission.repository';

export class PrismaProblemSubmissionRepository
  implements ProblemSubmissionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProblemSubmission | null> {
    const record = await this.prisma.problemSubmission.findUnique({
      where: { id },
    });
    if (!record) return null;
    return new ProblemSubmission(
      record.id,
      record.problemId,
      record.userId,
      record.language,
      record.code,
      record.mode,
      record.status,
      record.runtimeMs,
      record.memoryMb,
      record.score,
      record.createdAt,
      record.updatedAt
    );
  }

  async save(submission: ProblemSubmission): Promise<void> {
    await this.prisma.problemSubmission.update({
      where: { id: submission.id },
      data: {
        status: submission.status,
        runtimeMs: submission.runtimeMs,
        memoryMb: submission.memoryMb,
        score: submission.score,
        updatedAt: new Date(),
      },
    });
  }
}
