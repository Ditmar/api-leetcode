export interface Question {
  id: string;
  testId: string;
  type: 'MCQ' | 'PROGRAMMING';
  text: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  timeLimit?: number | null;
  options?: Record<string, unknown> | null;
  programmingData?: Record<string, unknown> | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
