import { TestRepository } from '../../domain/repositories/TestRepository';

interface AnswerInput {
  questionId: string;
  selectedOption?: string;
  code?: string;
  language?: string;
}

interface QuestionData {
  id: string;
  type: string;
  difficulty: string;
  points: number;
  options?: Record<string, unknown> | null;
}

interface BreakdownItem {
  questionId: string;
  type: string;
  difficulty: string;
  correct: boolean;
  points: number;
  maxPoints: number;
  selectedOption?: string;
  code?: string;
  language?: string;
}

export class SubmitTestUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(
    testId: string,
    sessionId: string,
    answers: AnswerInput[],
    userId: number
  ) {
    const session = await this.testRepo.getSessionById(sessionId);

    if (!session) {
      throw new Error('Invalid session');
    }

    if (session.userId !== userId) {
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

    const questions = await this.testRepo.getQuestionsByTestId(testId);

    let totalScore = 0;
    const maxScore = questions.reduce(
      (sum: number, q: QuestionData) => sum + q.points,
      0
    );

    const breakdown: BreakdownItem[] = answers.map((answer: AnswerInput) => {
      const question = questions.find(
        (q: QuestionData) => q.id === answer.questionId
      );

      if (!question) {
        return {
          questionId: answer.questionId,
          correct: false,
          points: 0,
          maxPoints: 0,
          type: 'UNKNOWN',
          difficulty: 'EASY',
        };
      }

      let correct = false;
      let pointsEarned = 0;

      if (question.type === 'MCQ' && question.options) {
        const options = question.options as { correct?: string };
        const correctAnswer = options.correct;
        correct = answer.selectedOption === correctAnswer;
        pointsEarned = correct ? question.points : 0;
        totalScore += pointsEarned;
      }

      if (question.type === 'PROGRAMMING') {
        correct = false;
        pointsEarned = 0;
      }

      return {
        questionId: question.id,
        type: question.type,
        difficulty: question.difficulty,
        correct,
        points: pointsEarned,
        maxPoints: question.points,
        ...(answer.selectedOption && { selectedOption: answer.selectedOption }),
        ...(answer.code && { code: answer.code, language: answer.language }),
      };
    });

    const submission = await this.testRepo.createSubmission({
      testId,
      sessionId,
      userId,
      score: totalScore,
      maxScore,
      breakdown: breakdown as unknown as Record<string, unknown>[],
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      submissionId: submission.id,
      testId,
      sessionId,
      score: totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      totalQuestions: questions.length,
      correctAnswers: breakdown.filter((b: BreakdownItem) => b.correct).length,
      breakdown,
      submittedAt: submission.submittedAt,
    };
  }
}
