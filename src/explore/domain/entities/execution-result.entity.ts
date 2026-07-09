export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  runtimeMs: number;
}

export class ExecutionResult {
  constructor(
    public readonly status: string,
    public readonly runtimeMs: number | null,
    public readonly memoryMb: number | null,
    public readonly score: number | null,
    public readonly compileError: string | null,
    public readonly testCaseResults: TestCaseResult[]
  ) {}
}
