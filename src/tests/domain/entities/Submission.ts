export interface Submission {
  id: string;
  testId: string;
  sessionId: string;
  userId: string;
  score: number;
  maxScore: number;
  breakdown: Record<string, unknown>[];
  submittedAt: Date;
}
