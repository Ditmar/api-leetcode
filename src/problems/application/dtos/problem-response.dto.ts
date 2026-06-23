import type {
  Problem,
  TestCase,
  StarterCode,
} from '../../domain/entities/problem.entity';
import type { GetProblemsMetaDto } from './get-problems.dto';

export interface TestCaseResponseDto {
  id: string;
  input: string;
  expectedOutput: string;
  explanation: string | null;
  order: number;
}

export interface StarterCodeResponseDto {
  id: string;
  language: string;
  code: string;
}

export interface ProblemSummaryDto {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  acceptedCount: number;
  submissionCount: number;
  acceptanceRate: number;
  isActive: boolean;
}

export interface ProblemDetailDto extends ProblemSummaryDto {
  description: string;
  constraints: string[];
  testCases: TestCaseResponseDto[];
  starterCodes: StarterCodeResponseDto[];
}

export interface PaginatedProblemsDto {
  data: ProblemSummaryDto[];
  meta: GetProblemsMetaDto;
}

export const toProblemSummaryDto = (problem: Problem): ProblemSummaryDto => ({
  id: problem.id,
  slug: problem.slug,
  title: problem.title,
  difficulty: problem.difficulty,
  tags: problem.tags,
  acceptedCount: problem.acceptedCount,
  submissionCount: problem.submissionCount,
  acceptanceRate: problem.acceptanceRate,
  isActive: problem.isActive,
});

export const toTestCaseDto = (testCase: TestCase): TestCaseResponseDto => ({
  id: testCase.id,
  input: testCase.input,
  expectedOutput: testCase.expectedOutput,
  explanation: testCase.explanation,
  order: testCase.order,
});

export const toStarterCodeDto = (
  starterCode: StarterCode
): StarterCodeResponseDto => ({
  id: starterCode.id,
  language: starterCode.language,
  code: starterCode.code,
});

export const toProblemDetailDto = (problem: Problem): ProblemDetailDto => ({
  ...toProblemSummaryDto(problem),
  description: problem.description,
  constraints: problem.constraints,
  testCases: problem.testCases.map(toTestCaseDto),
  starterCodes: problem.starterCodes.map(toStarterCodeDto),
});
