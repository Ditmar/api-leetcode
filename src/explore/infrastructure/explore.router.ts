import { Router } from 'express';

import { PrismaTopicRepository } from './persistence/prisma-topic.repository';

import { GetTopicsUseCase } from '../application/use-cases/get-topics.use-case';
import { GetTopicBySlugUseCase } from '../application/use-cases/get-topic-by-slug.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/get-categories.use-case';
import { GetExploreStatsUseCase } from '../application/use-cases/get-explore-stats.use-case';

import { ExploreController } from './controllers/explore.controller';

import { authMiddleware } from '../../share/infrastructure/middleware/auth.middleware';
import { prisma as getPrismaClient } from '../../share/infrastructure/prisma-client';

const exploreRouter = Router();

let cachedController: ExploreController | null = null;

const getController = (): ExploreController => {
  if (cachedController) {
    return cachedController;
  }

  const prisma = getPrismaClient;

  const repository = new PrismaTopicRepository(prisma);

  cachedController = new ExploreController(
    new GetTopicsUseCase(repository),
    new GetTopicBySlugUseCase(repository),
    new GetCategoriesUseCase(repository),
    new GetExploreStatsUseCase(repository)
  );

  return cachedController;
};

exploreRouter.get('/topics', (req, res) => getController().getTopics(req, res));

exploreRouter.get('/topics/:slug', (req, res) =>
  getController().getTopicBySlug(req, res)
);

exploreRouter.get('/categories', (req, res) =>
  getController().getCategories(req, res)
);

exploreRouter.get('/stats', authMiddleware, (req, res) =>
  getController().getStats(req, res)
);

export { exploreRouter };
