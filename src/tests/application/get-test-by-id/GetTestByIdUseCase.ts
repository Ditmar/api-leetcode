import { TestRepository } from '../../domain/repositories/TestRepository';

export class GetTestByIdUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(id: string) {
    const test = await this.testRepo.getById(id);

    if (!test) {
      throw new Error('Test not found');
    }

    const questions = test.questions || [];

    const questionsByType = {
      MCQ: questions.filter(q => q.type === 'MCQ').length,
      PROGRAMMING: questions.filter(q => q.type === 'PROGRAMMING').length,
    };

    const questionsByDifficulty = {
      EASY: questions.filter(q => q.difficulty === 'EASY').length,
      MEDIUM: questions.filter(q => q.difficulty === 'MEDIUM').length,
      HARD: questions.filter(q => q.difficulty === 'HARD').length,
    };

    return {
      id: test.id,
      name: test.name,
      description: test.description,
      company: test.company || null,
      difficulty: test.difficulty,
      duration: test.duration,
      isActive: test.isActive,
      totalQuestions: questions.length,
      questionsByType,
      questionsByDifficulty,
      maxScore: questions.reduce((sum, q) => sum + (q.points || 0), 0),
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };
  }
}
