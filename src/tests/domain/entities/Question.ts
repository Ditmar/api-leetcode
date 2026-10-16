import type {
  PrivateProgrammingData,
  PublicProgrammingData,
} from './ProgrammingData';

export interface Question {
  id: string;
  testId: string;
  type: 'MCQ' | 'PROGRAMMING';
  text: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  timeLimit: number | null;
  order: number;

  options?: Record<string, unknown> | null;
  correctAnswer?: string[] | null;

  programmingPublic?: PublicProgrammingData | null;
  programmingPrivate?: PrivateProgrammingData | null;

  createdAt: Date;
  updatedAt: Date;
}
