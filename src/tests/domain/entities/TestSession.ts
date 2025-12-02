export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
