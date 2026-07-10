export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface ExecutorInput {
  submissionId: string;
  code: string;
  timeoutMs: number;
  memoryMb: number;
  testCases: TestCase[];
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtimeMs: number;
  status?: 'success' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded';
}

export interface ExecutorOutput {
  testCaseResults: TestCaseResult[];
  totalRuntimeMs: number;
  peakMemoryMb: number;
  compileError?: string;
}

export interface LanguageExecutor {
  readonly language: string;
  execute(input: ExecutorInput): Promise<ExecutorOutput>;
}
