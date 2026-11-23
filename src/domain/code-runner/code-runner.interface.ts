export interface CodeFile {
  name?: string;
  content: string;
}

export interface ExecutionLimits {
  compileTimeoutMs?: number;
  runTimeoutMs?: number;
  memoryLimitBytes?: number;
  maxOutputSize?: number;
}

export interface RunCodeInput {
  language: string;
  files: CodeFile[];
  stdin?: string;
  args?: string[];
  limits?: ExecutionLimits;
}

export type ExecutionStatus =
  | 'success'
  | 'compile_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'output_limit_exceeded';

export interface StageResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  output?: string;
}

export interface RunCodeResult {
  status: ExecutionStatus;
  compile?: StageResult;
  run: StageResult;
  wallTimeMs: number;
  memoryUsedBytes?: number;
}

export interface CodeRunner {
  run(input: RunCodeInput): Promise<RunCodeResult>;
  validateRuntimes(): Promise<void>;
}
