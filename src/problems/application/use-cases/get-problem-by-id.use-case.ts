import type { ProblemRepository } from '../../domain/repositories/problem.repository';
import type { ProblemDetailDto } from '../dtos/problem-response.dto';
import { toProblemDetailDto } from '../dtos/problem-response.dto';

export class GetProblemByIdUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(id: string): Promise<ProblemDetailDto> {
    const problem = await this.problemRepository.findById(id);

    if (!problem) {
      throw new Error(`Problem with id ${id} not found`);
    }

    return toProblemDetailDto(problem);
  }
}
