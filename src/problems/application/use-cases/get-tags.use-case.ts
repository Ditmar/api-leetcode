import type { ProblemRepository } from '../../domain/repositories/problem.repository';

export class GetTagsUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(): Promise<string[]> {
    return this.problemRepository.findAllTags();
  }
}
