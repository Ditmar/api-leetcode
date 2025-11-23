export interface TestSession {
  id: string;
  testId: string;
  userId: number;
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
