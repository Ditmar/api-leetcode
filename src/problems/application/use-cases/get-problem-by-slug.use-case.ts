import type { ProblemRepository } from '../../domain/repositories/problem.repository';
import type { ProblemDetailDto } from '../dtos/problem-response.dto';
import { toProblemDetailDto } from '../dtos/problem-response.dto';

export class GetProblemBySlugUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(slug: string): Promise<ProblemDetailDto> {
    const problem = await this.problemRepository.findBySlug(slug);

    if (!problem) {
      throw new Error(`Problem with slug "${slug}" not found`);
    }

    return toProblemDetailDto(problem);
  }
}
