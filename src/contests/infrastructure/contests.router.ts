import { Router } from 'express';
import { ContestsController } from './controllers/contests.controller';
import { GetContestsUseCase } from '../application/use-cases/get-contests.use-case';
import { GetContestByIdUseCase } from '../application/use-cases/get-contest-by-id.use-case';
import { CreateContestUseCase } from '../application/use-cases/create-contest.use-case';
import { RegisterForContestUseCase } from '../application/use-cases/register-for-contest.use-case';
import { GetContestStatsUseCase } from '../application/use-cases/get-contest-stats.use-case';
import { PrismaContestRepository } from './persistence/prisma-contest.repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const repository = new PrismaContestRepository(prisma);

const getContestsUseCase = new GetContestsUseCase(repository);
const getContestByIdUseCase = new GetContestByIdUseCase(repository);
const createContestUseCase = new CreateContestUseCase(repository);
const registerForContestUseCase = new RegisterForContestUseCase(
  repository,
  prisma
);
const getContestStatsUseCase = new GetContestStatsUseCase(repository);

const controller = new ContestsController(
  getContestsUseCase,
  getContestByIdUseCase,
  createContestUseCase,
  registerForContestUseCase,
  getContestStatsUseCase
);

const router = Router();

router.get('/stats', (req, res) => controller.getContestStats(req, res));
router.get('/:id', (req, res) => controller.getContestById(req, res));
router.get('/', (req, res) => controller.getContests(req, res));
router.post('/:id/register', (req, res) =>
  controller.registerForContest(req, res)
);
router.post('/', (req, res) => controller.createContest(req, res));

export { router as contestRoutes };
