import { Contest } from '../../domain/entities/contest.entity';
import {
  ContestRepository,
  GetContestsParams,
} from '../../domain/repositories/contest.repository';
import { GetContestsDTO } from '../dtos/get-contests.dto';

export class GetContestsUseCase {
  constructor(private contestRepository: ContestRepository) {}

  async execute(params: GetContestsDTO): Promise<Contest[]> {
    const repositoryParams: GetContestsParams = {
      status: params.status,
      skip: params.skip || 0,
      take: params.take || 10,
    };

    return this.contestRepository.getAll(repositoryParams);
  }
}
