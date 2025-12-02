import {
  TestRepository,
  GetTestsParams,
} from '../../domain/repositories/TestRepository';

export class GetTestsUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(params: GetTestsParams) {
    if (params.page < 1) params.page = 1;
    if (params.limit < 1) params.limit = 10;
    if (params.limit > 100) params.limit = 100;

    const result = await this.testRepo.getAll(params);

    const formattedData = result.data.map(test => {
      const questions = test.questions || []; // ✅ Manejar undefined

      return {
        id: test.id,
        name: test.name,
        description: test.description,
        company: test.company || { id: '', name: 'Unknown', logo: null }, // ✅ Default
        difficulty: test.difficulty,
        duration: test.duration,
        totalQuestions: questions.length,
        questionsByType: {
          mcq: questions.filter(q => q.type === 'MCQ').length,
          programming: questions.filter(q => q.type === 'PROGRAMMING').length,
        },
        createdAt: test.createdAt,
      };
    });

    return {
      data: formattedData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
