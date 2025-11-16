import {
  TestRepository,
  GetTestsParams,
} from '../../domain/repositories/TestRepository';

interface QuestionSummary {
  id: string;
  type: string;
  difficulty: string;
}

interface TestData {
  id: string;
  name: string;
  description: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  questions: QuestionSummary[];
  difficulty: string;
  duration: number;
  isActive: boolean;
  createdAt: Date;
}

export class GetTestsUseCase {
  constructor(private testRepo: TestRepository) {}

  async execute(params: GetTestsParams) {
    if (params.page < 1) params.page = 1;
    if (params.limit < 1) params.limit = 10;
    if (params.limit > 100) params.limit = 100;

    const result = await this.testRepo.getAll(params);

    const formattedData = result.data.map((test: TestData) => ({
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
      totalQuestions: test.questions.length,
      questionsByType: {
        mcq: test.questions.filter((q: QuestionSummary) => q.type === 'MCQ')
          .length,
        programming: test.questions.filter(
          (q: QuestionSummary) => q.type === 'PROGRAMMING'
        ).length,
      },
      createdAt: test.createdAt,
    }));

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
