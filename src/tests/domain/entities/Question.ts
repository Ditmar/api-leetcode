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

  programmingData?: Record<string, unknown> | null;

  createdAt: Date;
  updatedAt: Date;
}
