import { TestRepository } from '../../domain/repositories/TestRepository';

interface AnswerInput {
  questionId: string;
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
    userId: string
  ) {
    const session = await this.testRepo.getSessionById(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (String(session.userId) !== String(userId)) {
      throw new Error('Unauthorized: Session does not belong to this user');
    }

    if (new Date() > session.expiresAt) {
      throw new Error('Session has expired');
    }

    if (!session.isActive) {
      throw new Error('Session is not active');
    }

    if (session.testId !== testId) {
      throw new Error('Session does not belong to this test');
    }

    const questions = await this.testRepo.getQuestionsByTestId(testId);

    if (questions.length === 0) {
      throw new Error('Test has no questions');
    }

    let totalScore = 0;
    let maxScore = 0;
    let correct = 0;
    let incorrect = 0;

    const breakdown: Array<{
      questionId: string;
      correct: boolean;
      points: number;
      maxPoints: number;
    }> = [];

    for (const question of questions) {
      maxScore += question.points;

      const answer = answers.find(a => a.questionId === question.id);

      if (!answer) {
        breakdown.push({
          questionId: question.id,
          correct: false,
          points: 0,
          maxPoints: question.points,
        });
        incorrect++;
        continue;
      }

      let isCorrect = false;

      if (question.type === 'MCQ' && question.correctAnswer) {
        const correctAnswers = question.correctAnswer as string[];
        isCorrect = correctAnswers.includes(answer.selectedOption || '');
      } else if (question.type === 'PROGRAMMING') {
        isCorrect = false;
      }

      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      breakdown.push({
        questionId: question.id,
        correct: isCorrect,
        points: pointsEarned,
        maxPoints: question.points,
      });

      await this.testRepo.saveAnswer({
        sessionId,
        questionId: question.id,
        selectedOption: answer.selectedOption,
        code: answer.code,
        language: answer.language,
      });
    }

    const submission = await this.testRepo.createSubmission({
      testId,
      sessionId,
      userId,
      score: totalScore,
      maxScore,
      breakdown: [
        {
          correct,
          incorrect,
          total: questions.length,
          details: breakdown,
        },
      ],
    });

    return {
      submissionId: submission.id,
      score: totalScore,
      maxScore,
      percentage: (totalScore / maxScore) * 100,
      passed: totalScore / maxScore >= 0.7,
      breakdown: {
        correct,
        incorrect,
        total: questions.length,
      },
      submittedAt: submission.submittedAt,
    };
  }
}
