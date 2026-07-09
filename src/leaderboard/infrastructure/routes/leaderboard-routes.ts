import { Router } from 'express';
import { getPrismaClient } from '../../../share/infrastructure/prisma';
import { GetLeaderboardUseCase } from '../../application/use-cases/get-leaderboard.use-case';
import { PrismaLeaderboardRepository } from '../persistence/prisma-leaderboard.repository';
import { LeaderboardController } from '../controllers/leaderboard.controller';
import { InMemoryLeaderboardCache } from '../cache/leaderboard-cache';

const router = Router();
const repository = new PrismaLeaderboardRepository(getPrismaClient());
const cache = new InMemoryLeaderboardCache();
const controller = new LeaderboardController(
  new GetLeaderboardUseCase(repository, cache)
);

router.get('/', (req, res) => controller.get(req, res));

export { router as leaderboardRoutes };
