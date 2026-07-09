import type { Request, Response } from 'express';
import type { GetLeaderboardUseCase } from '../../application/use-cases/get-leaderboard.use-case';

export class LeaderboardController {
  constructor(private readonly getLeaderboard: GetLeaderboardUseCase) {}

  async get(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

      if (period && !['weekly', 'monthly', 'all-time'].includes(period)) {
        res.status(400).json({
          message: 'Invalid period. Must be weekly, monthly or all-time',
        });
        return;
      }

      const result = await this.getLeaderboard.execute({
        period:
          (period as 'weekly' | 'monthly' | 'all-time' | undefined) ??
          'all-time',
        page,
        pageSize,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to get leaderboard: ${error.message}` });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
