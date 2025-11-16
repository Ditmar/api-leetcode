import { TestRepository } from '../../domain/repositories/TestRepository';

interface QuestionDetail {
  id: string;
  type: string;
  difficulty: string;
  points: number;
}

export class GetTestByIdUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(id: string) {
    const test = await this.testRepo.getById(id);

    if (!test) {
      throw new Error('Test not found');
    }

    const mcqQuestions = test.questions.filter(
      (q: QuestionDetail) => q.type === 'MCQ'
    );
    const programmingQuestions = test.questions.filter(
      (q: QuestionDetail) => q.type === 'PROGRAMMING'
    );

    const easyQuestions = test.questions.filter(
      (q: QuestionDetail) => q.difficulty === 'EASY'
    );
    const mediumQuestions = test.questions.filter(
      (q: QuestionDetail) => q.difficulty === 'MEDIUM'
    );
    const hardQuestions = test.questions.filter(
      (q: QuestionDetail) => q.difficulty === 'HARD'
    );

    return {
      id: test.id,
      name: test.name,
      description: test.description,
      company: {
        id: test.company.id,
        name: test.company.name,
        logo: test.company.logo,
      },
      difficulty: test.difficulty,
      duration: test.duration,
      isActive: test.isActive,
      statistics: {
        totalQuestions: test.questions.length,
        questionsByType: {
          mcq: mcqQuestions.length,
          programming: programmingQuestions.length,
        },
        questionsByDifficulty: {
          easy: easyQuestions.length,
          medium: mediumQuestions.length,
          hard: hardQuestions.length,
        },
        totalPoints: test.questions.reduce(
          (sum: number, q: QuestionDetail) => sum + q.points,
          0
        ),
      },
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };
  }
}
