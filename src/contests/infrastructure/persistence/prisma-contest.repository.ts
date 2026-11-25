import {
  PrismaClient,
  Prisma,
  Contest as PrismaContest,
  ContestProblem as PrismaContestProblem,
  ContestProblemDef as PrismaProblem,
} from '@prisma/client';
import {
  Contest,
  ContestProblem as ContestProblemEntity,
} from '../../domain/entities/contest.entity';
import {
  ContestRepository,
  GetContestsParams,
  ContestStats,
} from '../../domain/repositories/contest.repository';

type RawContest = PrismaContest & {
  problems: Array<PrismaContestProblem & { problem: PrismaProblem }>;
};

export class PrismaContestRepository implements ContestRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(params: GetContestsParams): Promise<Contest[]> {
    const where: Prisma.ContestWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }

    const contests = await this.prisma.contest.findMany({
      where,
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
      skip: params.skip || 0,
      take: params.take || 10,
    });

    return contests.map(c => this.mapToDomain(c));
  }

  async getById(id: string): Promise<Contest | null> {
    const contest = await this.prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!contest) return null;
    return this.mapToDomain(contest);
  }

  async create(contest: Contest, problemIds?: string[]): Promise<Contest> {
    const created = await this.prisma.contest.create({
      data: {
        title: contest.getTitle(),
        description: contest.getDescription(),
        difficulty: contest.getDifficulty(),
        status: contest.getStatus().getValue(),
        prize: contest.getPrize(),
        startTime: contest.getStartTime(),
        endTime: contest.getEndTime(),
        durationMins: contest.getDurationMins(),
        isActive: contest.isActiveContest(),
        problems:
          problemIds && problemIds.length
            ? {
                create: problemIds.map(problemId => ({
                  problem: {
                    connect: { id: problemId },
                  },
                })),
              }
            : undefined,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    return this.mapToDomain(created);
  }

  async getStats(): Promise<ContestStats> {
    const [live, upcoming, past, totalRegistrations] = await Promise.all([
      this.prisma.contest.count({
        where: {
          status: 'active',
          isActive: true,
        },
      }),
      this.prisma.contest.count({
        where: {
          status: 'upcoming',
          isActive: true,
        },
      }),
      this.prisma.contest.count({
        where: {
          status: 'past',
        },
      }),
      this.prisma.contestRegistration.count(),
    ]);

    return {
      live,
      upcoming,
      past,
      totalRegistrations,
    };
  }

  private mapToDomain(raw: RawContest): Contest {
    const problems: ContestProblemEntity[] = (raw.problems || []).map(p => ({
      id: p.id,
      problemId: p.problemId,
      order: p.order,
      points: p.points,
      problem: p.problem
        ? {
            id: p.problem.id,
            title: p.problem.title,
            description: p.problem.description,
            difficulty: p.problem.difficulty,
          }
        : undefined,
    }));

    return Contest.create(
      raw.id,
      raw.title,
      raw.description,
      raw.difficulty,
      raw.status,
      raw.startTime,
      raw.endTime,
      raw.durationMins,
      raw.isActive,
      raw.prize,
      raw.createdAt,
      raw.updatedAt,
      problems
    );
  }
}
