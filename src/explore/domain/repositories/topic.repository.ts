import { TopicEntity } from '../entities/topic.entity';

export interface GetTopicsFilters {
  category?: string;
  difficulty?: string;
}

export interface ExploreStats {
  totalTopics: number;
  solvedProblems: number;
  overallProgress: number;
}

export abstract class TopicRepository {
  abstract findAll(
    filters: GetTopicsFilters,
    userId?: string
  ): Promise<TopicEntity[]>;

  abstract findBySlug(
    slug: string,
    userId?: string
  ): Promise<TopicEntity | null>;

  abstract getCategories(): Promise<string[]>;

  abstract getStats(userId: string): Promise<ExploreStats>;

  abstract updateProgress(userId: string, problemId: string): Promise<void>;
}
