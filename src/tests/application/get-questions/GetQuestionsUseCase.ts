import { TestRepository } from '../../domain/repositories/TestRepository';

interface QuestionData {
  id: string;
  type: string;
  text: string;
  difficulty: string;
  points: number;
  timeLimit?: number | null;
  order: number;
  options?: Record<string, unknown> | null;
  programmingData?: Record<string, unknown> | null;
}

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

    const formattedQuestions = questions.map((q: QuestionData) => {
      const baseQuestion = {
        id: q.id,
        type: q.type,
        text: q.text,
        difficulty: q.difficulty,
        points: q.points,
        timeLimit: q.timeLimit,
        order: q.order,
      };

      if (q.type === 'MCQ' && q.options) {
        return {
          ...baseQuestion,
          options: q.options,
        };
      }

      if (q.type === 'PROGRAMMING' && q.programmingData) {
        return {
          ...baseQuestion,
          programmingData: q.programmingData,
        };
      }

      return baseQuestion;
    });

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
