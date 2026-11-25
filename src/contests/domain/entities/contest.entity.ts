import { ContestStatus } from '../value-objects/contest-status.vo';

const MAX_CONTEST_DURATION_MINS = 10080;

class ContestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContestValidationError';
  }
}

export interface ContestProblem {
  id: string;
  problemId: string;
  order: number;
  points: number;
  problem?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  };
}

export class Contest {
  private constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly description: string,
    private readonly difficulty: string,
    private readonly status: ContestStatus,
    private readonly startTime: Date,
    private readonly endTime: Date,
    private readonly durationMins: number,
    private readonly isActive: boolean,
    private readonly prize: string | null,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly problems: ContestProblem[] = []
  ) {}

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getDifficulty(): string {
    return this.difficulty;
  }

  getStatus(): ContestStatus {
    return this.status;
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date {
    return this.endTime;
  }

  getDurationMins(): number {
    return this.durationMins;
  }

  isActiveContest(): boolean {
    return this.isActive;
  }

  getPrize(): string | null {
    return this.prize;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getProblems(): ContestProblem[] {
    return this.problems;
  }

  static create(
    id: string,
    title: string,
    description: string,
    difficulty: string,
    status: string,
    startTime: Date,
    endTime: Date,
    durationMins: number,
    isActive: boolean,
    prize: string | null,
    createdAt: Date,
    updatedAt: Date,
    problems?: ContestProblem[]
  ): Contest {
    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    if (durationMins <= 0 || durationMins > MAX_CONTEST_DURATION_MINS) {
      throw new ContestValidationError(
        'Duration must be between 1 and 10080 minutes'
      );
    }

    return new Contest(
      id,
      title,
      description,
      difficulty,
      ContestStatus.from(status),
      startTime,
      endTime,
      durationMins,
      isActive,
      prize,
      createdAt,
      updatedAt,
      problems || []
    );
  }
}
