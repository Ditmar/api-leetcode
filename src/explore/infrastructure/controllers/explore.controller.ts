import { Request, Response } from 'express';

import { GetTopicsUseCase } from '../../application/use-cases/get-topics.use-case';
import { GetTopicBySlugUseCase } from '../../application/use-cases/get-topic-by-slug.use-case';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories.use-case';
import { GetExploreStatsUseCase } from '../../application/use-cases/get-explore-stats.use-case';

export class ExploreController {
  constructor(
    private readonly getTopicsUseCase: GetTopicsUseCase,
    private readonly getTopicBySlugUseCase: GetTopicBySlugUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getExploreStatsUseCase: GetExploreStatsUseCase
  ) {}

  getTopics = async (req: Request, res: Response) => {
    try {
      const { category, difficulty, page, limit } = req.query;

      const topics = await this.getTopicsUseCase.execute({
        category: category as string,
        difficulty: difficulty as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      return res.json(topics);
    } catch (error) {
      console.error('[ExploreController:getTopics]', error);

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  getTopicBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;

      if (!slug || slug.trim() === '') {
        return res.status(400).json({
          message: 'The "slug" parameter is required.',
        });
      }

      const topic = await this.getTopicBySlugUseCase.execute(slug);

      if (!topic) {
        return res.status(404).json({
          message: 'Topic not found.',
        });
      }

      return res.status(200).json(topic);
    } catch (error) {
      console.error('[ExploreController:getTopicBySlug]', error);

      return res.status(500).json({
        message: 'Internal server error.',
      });
    }
  };

  getCategories = async (_req: Request, res: Response) => {
    try {
      const categories = await this.getCategoriesUseCase.execute();

      return res.json(categories);
    } catch (error) {
      console.error('[ExploreController:getCategories]', error);

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const authRequest = req as Request & {
        user?: {
          id: string;
          email: string;
        };
      };

      if (!authRequest.user) {
        return res.status(401).json({
          message: 'Unauthenticated user',
        });
      }

      const stats = await this.getExploreStatsUseCase.execute(
        authRequest.user.id
      );

      return res.json(stats);
    } catch (error) {
      console.error('[ExploreController:getStats]', error);

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  };
}
