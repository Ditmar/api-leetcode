import { Request, Response } from 'express';
import { GetContestsUseCase } from '../../application/use-cases/get-contests.use-case';
import { GetContestByIdUseCase } from '../../application/use-cases/get-contest-by-id.use-case';
import { CreateContestUseCase } from '../../application/use-cases/create-contest.use-case';
import { RegisterForContestUseCase } from '../../application/use-cases/register-for-contest.use-case';
import { GetContestStatsUseCase } from '../../application/use-cases/get-contest-stats.use-case';
import { ContestResponseDTO } from '../../application/dtos/contest-response.dto';
import { Contest, ContestProblem } from '../../domain/entities/contest.entity';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
  userId?: string;
}

export class ContestsController {
  constructor(
    private getContestsUseCase: GetContestsUseCase,
    private getContestByIdUseCase: GetContestByIdUseCase,
    private createContestUseCase: CreateContestUseCase,
    private registerForContestUseCase: RegisterForContestUseCase,
    private getContestStatsUseCase: GetContestStatsUseCase
  ) {}

  async getContests(req: Request, res: Response): Promise<void> {
    try {
      const { status, skip = 0, take = 10 } = req.query;
      const validStatus = ['upcoming', 'active', 'past'] as const;
      const statusValue =
        typeof status === 'string' &&
        (validStatus as readonly string[]).includes(status)
          ? (status as (typeof validStatus)[number])
          : undefined;

      const contests = await this.getContestsUseCase.execute({
        status: statusValue,
        skip: Number(skip),
        take: Number(take),
      });

      const dto = contests.map(c => this.mapToResponseDTO(c));
      res.status(200).json({
        success: true,
        data: dto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getContestStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.getContestStatsUseCase.execute();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getContestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await this.getContestByIdUseCase.execute(id as string);

      if (!contest) {
        res.status(404).json({
          success: false,
          error: 'Contest not found',
        });
        return;
      }

      const dto = this.mapToResponseDTO(contest);
      res.status(200).json({
        success: true,
        data: dto,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  async createContest(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        difficulty,
        startTime,
        endTime,
        durationMins,
        prize,
        problemIds,
      } = req.body;

      const contest = await this.createContestUseCase.execute({
        title,
        description,
        difficulty,
        startTime,
        endTime,
        durationMins,
        prize,
        problemIds,
      });

      const dto = this.mapToResponseDTO(contest);
      res.status(201).json({
        success: true,
        data: dto,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Bad request',
      });
    }
  }

  async registerForContest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { user, userId } = req as AuthenticatedRequest;
      const currentUserId = user?.id || userId;

      if (!currentUserId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const result = await this.registerForContestUseCase.execute(
        id as string,
        currentUserId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Internal server error';

      if (errorMsg === 'Contest not found') {
        res.status(404).json({
          success: false,
          error: errorMsg,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: errorMsg,
      });
    }
  }

  private mapToResponseDTO(contest: Contest): ContestResponseDTO {
    return {
      id: contest.getId(),
      title: contest.getTitle(),
      description: contest.getDescription(),
      difficulty: contest.getDifficulty(),
      status: contest.getStatus().getValue(),
      startTime: contest.getStartTime().toISOString(),
      endTime: contest.getEndTime().toISOString(),
      durationMins: contest.getDurationMins(),
      prize: contest.getPrize(),
      isActive: contest.isActiveContest(),
      createdAt: contest.getCreatedAt().toISOString(),
      updatedAt: contest.getUpdatedAt().toISOString(),
      problems: contest.getProblems().map((p: ContestProblem) => ({
        id: p.id,
        problemId: p.problemId,
        order: p.order,
        points: p.points,
        problem: p.problem && {
          id: p.problem.id,
          title: p.problem.title,
          description: p.problem.description,
          difficulty: p.problem.difficulty,
        },
      })),
    };
  }
}
