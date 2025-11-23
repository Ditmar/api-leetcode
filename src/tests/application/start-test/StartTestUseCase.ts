import { TestRepository } from '../../domain/repositories/TestRepository';

export class StartTestUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(testId: string, userId: number) {
    const test = await this.testRepo.getById(testId);

    if (!test) {
      throw new Error('Test not found');
    }

    if (!test.isActive) {
      throw new Error('Test is not active');
    }

    const expiresAt = new Date(Date.now() + test.duration * 60000);

    const session = await this.testRepo.createSession(
      testId,
      userId,
      expiresAt
    );

    return {
      sessionId: session.id,
      testId: test.id,
      testName: test.name,
      duration: test.duration,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      remainingTime: test.duration * 60,
      totalQuestions: test.questions.length,
    };
  }
}
