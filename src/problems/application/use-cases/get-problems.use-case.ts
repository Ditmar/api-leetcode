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
    const page =
      Number.isInteger(dto.page) && (dto.page as number) > 0
        ? (dto.page as number)
        : 1;
    const pageSize =
      Number.isInteger(dto.pageSize) && (dto.pageSize as number) > 0
        ? Math.min(dto.pageSize as number, 100)
        : 20;

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
