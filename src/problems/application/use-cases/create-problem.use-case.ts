import type { ProblemRepository } from '../../domain/repositories/problem.repository';
import type { CreateProblemDto } from '../dtos/create-problem.dto';
import type { ProblemDetailDto } from '../dtos/problem-response.dto';
import { toProblemDetailDto } from '../dtos/problem-response.dto';
import {
  Problem,
  TestCase,
  StarterCode,
} from '../../domain/entities/problem.entity';
import { Difficulty } from '../../domain/value-objects/difficulty.vo';
import { ProblemSlug } from '../../domain/value-objects/problem-slug.vo';
import { v4 as uuidv4 } from 'uuid';

export class CreateProblemUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(dto: CreateProblemDto): Promise<ProblemDetailDto> {
    const slug = new ProblemSlug(dto.slug);
    const difficulty = new Difficulty(dto.difficulty);

    const testCases = dto.testCases.map(
      tc =>
        new TestCase(
          uuidv4(),
          '',
          tc.input,
          tc.expectedOutput,
          tc.explanation ?? null,
          tc.isExample,
          tc.order
        )
    );

    const starterCodes = dto.starterCodes.map(
      sc => new StarterCode(uuidv4(), '', sc.language, sc.code)
    );

    const problem = new Problem(
      uuidv4(),
      slug.getValue(),
      dto.title,
      dto.description,
      difficulty.getValue(),
      dto.tags,
      dto.constraints,
      true,
      0,
      0,
      testCases,
      starterCodes
    );

    const saved = await this.problemRepository.save(problem);

    return toProblemDetailDto(saved);
  }
}
