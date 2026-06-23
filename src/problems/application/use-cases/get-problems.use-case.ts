import type { ProblemRepository } from '../../domain/repositories/problem.repository';
import type {
  GetProblemsDto,
  GetProblemsMetaDto,
} from '../dtos/get-problems.dto';
import type {
  PaginatedProblemsDto,
  ProblemSummaryDto,
} from '../dtos/problem-response.dto';
import { toProblemSummaryDto } from '../dtos/problem-response.dto';

export class GetProblemsUseCase {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async execute(dto: GetProblemsDto): Promise<PaginatedProblemsDto> {
    const page = dto.page ?? 1;
    const pageSize = Math.min(dto.pageSize ?? 20, 100);

    const { problems, total } = await this.problemRepository.findMany({
      search: dto.search,
      difficulty: dto.difficulty,
      tag: dto.tag,
      page,
      pageSize,
    });

    const data: ProblemSummaryDto[] = problems.map(toProblemSummaryDto);

    const meta: GetProblemsMetaDto = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { data, meta };
  }
}
