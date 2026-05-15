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
    const { category, difficulty } = req.query;

    const topics = await this.getTopicsUseCase.execute({
      category: category as string,
      difficulty: difficulty as string,
    });

    return res.json(topics);
  };

  getTopicBySlug = async (req: Request, res: Response) => {
    const slug = req.params.slug as string;

    const topic = await this.getTopicBySlugUseCase.execute(slug);

    if (!topic) {
      return res.status(404).json({
        message: 'Topic not found',
      });
    }

    return res.json(topic);
  };

  getCategories = async (_req: Request, res: Response) => {
    const categories = await this.getCategoriesUseCase.execute();

    return res.json(categories);
  };

  getStats = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const stats = await this.getExploreStatsUseCase.execute(userId);

    return res.json(stats);
  };
}
