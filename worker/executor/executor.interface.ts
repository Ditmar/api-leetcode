export type SupportedLanguage = 'cpp' | 'python' | 'javascript' | 'java';

export interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface ExecutorInput {
  submissionId: string;
  code: string;
  language: SupportedLanguage;
  testCases: TestCaseInput[];
  /** Time limit per test case run, in milliseconds */
  timeoutMs: number;
  /** Memory limit for the container, in megabytes */
  memoryMb: number;
}

export type TestCaseStatus =
  | 'passed'
  | 'failed'
  | 'runtime_error'
  | 'time_limit_exceeded';

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  status: TestCaseStatus;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtimeMs: number;
}

export type ExecutionStatus =
  | 'accepted'
  | 'wrong_answer'
  | 'compile_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'infra_error';

export interface ExecutorOutput {
  status: ExecutionStatus;
  testCaseResults: TestCaseResult[];
  totalRuntimeMs: number;
  peakMemoryMb: number;
  compileError?: string;
  /**
   * Populated only when status is 'infra_error': Docker unavailable,
   * spawn ENOENT, unexpected disk errors, etc. This is not a verdict on
   * the user's code, so it's kept separate from compileError.
   */
  infraError?: string;
}

/**
 * Contract every language adapter (CppExecutor, PythonExecutor, ...)
 * must implement so the ExecutionWorker can treat them interchangeably.
 */
export interface LanguageExecutor {
  readonly language: SupportedLanguage;
  execute(input: ExecutorInput): Promise<ExecutorOutput>;
}
