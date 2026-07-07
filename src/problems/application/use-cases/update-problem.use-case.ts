import type { ProblemRepository } from '../../domain/repositories/problem.repository';
import type { UpdateProblemDto } from '../dtos/create-problem.dto';
import type { ProblemDetailDto } from '../dtos/problem-response.dto';
import { toProblemDetailDto } from '../dtos/problem-response.dto';

export class UpdateProblemUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(id: string, dto: UpdateProblemDto): Promise<ProblemDetailDto> {
    const existing = await this.problemRepository.findById(id);

    if (!existing) {
      throw new Error(`Problem with id ${id} not found`);
    }

    const updated = await this.problemRepository.update(id, dto);

    return toProblemDetailDto(updated);
  }
}
