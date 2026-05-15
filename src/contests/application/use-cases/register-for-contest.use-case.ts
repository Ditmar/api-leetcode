import { ContestRepository } from '../../domain/repositories/contest.repository';
import { PrismaClient } from '@prisma/client';

export class RegisterForContestUseCase {
  constructor(
    private contestRepository: ContestRepository,
    private prisma: PrismaClient
  ) {}

  async execute(
    contestId: string,
    userId: string
  ): Promise<{ registered: boolean }> {
    const contest = await this.contestRepository.getById(contestId);
    if (!contest) {
      throw new Error('Contest not found');
    }

    const existing = await this.prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
    });

    if (existing) {
      return { registered: true };
    }

    await this.prisma.contestRegistration.create({
      data: {
        contestId,
        userId,
      },
    });

    return { registered: true };
  }
}
