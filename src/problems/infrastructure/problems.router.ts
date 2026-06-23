import { Router } from 'express';
import { getPrismaClient } from '../../share/infrastructure/prisma';
import { authMiddleware } from '../../share/infrastructure/middleware/auth.middleware';
import { PrismaProblemRepository } from './persistence/prisma-problem.repository';
import { ProblemsController } from './controllers/problems.controller';
import { GetProblemsUseCase } from '../application/use-cases/get-problems.use-case';
import { GetProblemByIdUseCase } from '../application/use-cases/get-problem-by-id.use-case';
import { GetProblemBySlugUseCase } from '../application/use-cases/get-problem-by-slug.use-case';
import { GetTagsUseCase } from '../application/use-cases/get-tags.use-case';
import { GetStatsUseCase } from '../application/use-cases/get-stats.use-case';
import { CreateProblemUseCase } from '../application/use-cases/create-problem.use-case';
import { UpdateProblemUseCase } from '../application/use-cases/update-problem.use-case';

const repository = new PrismaProblemRepository(getPrismaClient());

const controller = new ProblemsController(
  new GetProblemsUseCase(repository),
  new GetProblemByIdUseCase(repository),
  new GetProblemBySlugUseCase(repository),
  new GetTagsUseCase(repository),
  new GetStatsUseCase(repository),
  new CreateProblemUseCase(repository),
  new UpdateProblemUseCase(repository)
);

const problemsRouter = Router();

problemsRouter.get('/', (req, res) => controller.list(req, res));
problemsRouter.get('/tags', (req, res) => controller.tags(req, res));
problemsRouter.get('/stats', authMiddleware, (req, res) =>
  controller.stats(req, res)
);
problemsRouter.get('/:id', (req, res) => controller.getById(req, res));
problemsRouter.get('/slug/:slug', (req, res) => controller.getBySlug(req, res));
problemsRouter.post('/', authMiddleware, (req, res) =>
  controller.create(req, res)
);
problemsRouter.patch('/:id', authMiddleware, (req, res) =>
  controller.update(req, res)
);
problemsRouter.delete('/:id', authMiddleware, (req, res) =>
  controller.remove(req, res)
);

export { problemsRouter };
