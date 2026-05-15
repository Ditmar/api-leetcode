import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { PrismaTopicRepository } from './persistence/prisma-topic.repository';

import { GetTopicsUseCase } from '../application/use-cases/get-topics.use-case';
import { GetTopicBySlugUseCase } from '../application/use-cases/get-topic-by-slug.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/get-categories.use-case';
import { GetExploreStatsUseCase } from '../application/use-cases/get-explore-stats.use-case';

import { ExploreController } from './controllers/explore.controller';

import { authMiddleware } from '../../share/infrastructure/middleware/auth.middleware';

const exploreRouter = Router();

const prisma = new PrismaClient();

const repository = new PrismaTopicRepository(prisma);

const controller = new ExploreController(
  new GetTopicsUseCase(repository),
  new GetTopicBySlugUseCase(repository),
  new GetCategoriesUseCase(repository),
  new GetExploreStatsUseCase(repository)
);

exploreRouter.get('/topics', controller.getTopics);

exploreRouter.get('/topics/:slug', controller.getTopicBySlug);

exploreRouter.get('/categories', controller.getCategories);

exploreRouter.get('/stats', authMiddleware, controller.getStats);

export { exploreRouter };
