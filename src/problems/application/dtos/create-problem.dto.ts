export interface CreateProblemDto {
  slug: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  constraints: string[];
  testCases: CreateTestCaseDto[];
  starterCodes: CreateStarterCodeDto[];
}

export interface CreateTestCaseDto {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isExample: boolean;
  order: number;
}

export interface CreateStarterCodeDto {
  language: string;
  code: string;
}

export interface UpdateProblemDto {
  title?: string;
  description?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  constraints?: string[];
  isActive?: boolean;
}
