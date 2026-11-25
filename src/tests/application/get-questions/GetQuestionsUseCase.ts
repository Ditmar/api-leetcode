import { TestRepository } from '../../domain/repositories/TestRepository';
import { toPublicQuestionDto } from '../dtos/public-question.dto';

export class GetQuestionsUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(testId: string, sessionId: string, userId: string) {
    const session = await this.testRepo.getSessionById(sessionId);

    if (!session) {
      throw new Error('Invalid session');
    }

    if (String(session.userId) !== String(userId)) {
      throw new Error('Unauthorized: Session does not belong to user');
    }

    if (!session.isActive) {
      throw new Error('Session is not active');
    }

    const now = new Date();
    if (now > session.expiresAt) {
      throw new Error('Session has expired');
    }

    if (session.testId !== testId) {
      throw new Error('Session does not match test');
    }

    const remainingTime = Math.max(
      0,
      Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000)
    );

    const questions = await this.testRepo.getQuestionsByTestId(testId);

    const formattedQuestions = questions.map(toPublicQuestionDto);

    return {
      sessionId: session.id,
      testId,
      remainingTime,
      expiresAt: session.expiresAt,
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length,
    };
  }
}
