import type { Problem } from '../entities/problem.entity';

export interface ProblemFilters {
  search?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tag?: string;
  page: number;
  pageSize: number;
}

export interface TopicInfo {
  id: string;
  title: string;
  slug: string;
}

export abstract class ProblemRepository {
  abstract findTopicsByProblemId(problemId: string): Promise<TopicInfo[]>;

  abstract findProblemIdsByTopicId(topicId: string): Promise<string[]>;

  abstract findSolvedProblemIdsByUserAndTopic(
    userId: string,
    topicId: string
  ): Promise<string[]>;

  abstract findMany(
    filters: ProblemFilters
  ): Promise<{ problems: Problem[]; total: number }>;

  abstract findById(id: string): Promise<Problem | null>;

  abstract findBySlug(slug: string): Promise<Problem | null>;

  abstract findAllTags(): Promise<string[]>;

  abstract save(problem: Problem): Promise<Problem>;

  abstract update(id: string, data: Partial<Problem>): Promise<Problem>;

  abstract softDelete(id: string): Promise<void>;

  abstract findStatsByUser(
    userId: string
  ): Promise<{ solved: number; attempted: number; total: number }>;

  abstract updateUserProgress?(
    userId: string,
    problemId: string
  ): Promise<void>;
}
