export interface Submission {
  id: string;
  testId: string;
  sessionId: string;
  userId: number;
  score: number;
  maxScore: number;
  breakdown: Record<string, unknown>[];
  submittedAt: Date;
}
