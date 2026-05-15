import { Contest } from '../entities/contest.entity';

export interface GetContestsParams {
  status?: string;
  skip?: number;
  take?: number;
}

export interface ContestStats {
  live: number;
  upcoming: number;
  past: number;
  totalRegistrations: number;
}

export abstract class ContestRepository {
  abstract getAll(params: GetContestsParams): Promise<Contest[]>;
  abstract getById(id: string): Promise<Contest | null>;
  abstract create(contest: Contest): Promise<Contest>;
  abstract getStats(): Promise<ContestStats>;
}
