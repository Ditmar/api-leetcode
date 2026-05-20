import { Contest } from '../../domain/entities/contest.entity';
import { ContestRepository } from '../../domain/repositories/contest.repository';
import { CreateContestDTO } from '../dtos/create-contest.dto';
import { v4 as uuidv4 } from 'uuid';

export class CreateContestUseCase {
  constructor(private contestRepository: ContestRepository) {}

  async execute(dto: CreateContestDTO): Promise<Contest> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    if (dto.durationMins <= 0) {
      throw new Error('Duration must be positive');
    }

    const contest = Contest.create(
      uuidv4(),
      dto.title,
      dto.description,
      dto.difficulty,
      'upcoming',
      startTime,
      endTime,
      dto.durationMins,
      true,
      dto.prize || null,
      new Date(),
      new Date(),
      []
    );

    return this.contestRepository.create(contest, dto.problemIds);
  }
}
