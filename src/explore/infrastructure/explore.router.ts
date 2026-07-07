import { Router } from 'express';

import { PrismaTopicRepository } from './persistence/prisma-topic.repository';

import { GetTopicsUseCase } from '../application/use-cases/get-topics.use-case';
import { GetTopicBySlugUseCase } from '../application/use-cases/get-topic-by-slug.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/get-categories.use-case';
import { GetExploreStatsUseCase } from '../application/use-cases/get-explore-stats.use-case';

import { ExploreController } from './controllers/explore.controller';

import { authMiddleware } from '../../share/infrastructure/middleware/auth.middleware';
import { prisma as getPrismaClient } from '../../share/infrastructure/prisma-client';
import { PrismaUserRepository } from './persistence/prisma-user.repository';

const exploreRouter = Router();

let cachedController: ExploreController | null = null;

const getController = (): ExploreController => {
  if (cachedController) {
    return cachedController;
  }

  const prisma = getPrismaClient;

  const repository = new PrismaTopicRepository(prisma);
  const userRepository = new PrismaUserRepository(prisma);

  cachedController = new ExploreController(
    new GetTopicsUseCase(repository),
    new GetTopicBySlugUseCase(repository),
    new GetCategoriesUseCase(repository),
    new GetExploreStatsUseCase(repository, userRepository)
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

/**
 * @openapi
 * /explore/stats:
 *   get:
 *     summary: Get explore statistics for the authenticated user.
 *     tags:
 *       - Explore
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Explore statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTopics:
 *                   type: integer
 *                 solvedProblems:
 *                   type: integer
 *                 overallProgress:
 *                   type: integer
 *       401:
 *         description: User is not authenticated or the user is invalid.
 *       500:
 *         description: Internal server error.
 */
exploreRouter.get('/stats', authMiddleware, (req, res) =>
  getController().getStats(req, res)
);

export { exploreRouter };
