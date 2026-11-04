import type {
  CodeRunner,
  RunCodeInput,
  RunCodeResult,
} from '../../domain/code-runner/code-runner.interface';
import { PistonInfrastructureError } from './piston-code-runner';

export interface FakeCodeRunnerOptions {
  mockResult?: RunCodeResult;
  shouldFailValidation?: boolean;
  validationErrorMessage?: string;
}

const DEFAULT_MOCK_RESULT: RunCodeResult = {
  status: 'success',
  run: {
    stdout: '',
    stderr: '',
    code: 0,
    signal: null,
    output: '',
  },
  wallTimeMs: 1,
};

export class FakeCodeRunner implements CodeRunner {
  public mockResult: RunCodeResult;
  public lastInput: RunCodeInput | null = null;
  public readonly executedInputs: RunCodeInput[] = [];
  public shouldFailValidation: boolean;
  public validationErrorMessage: string;

  constructor(options: FakeCodeRunnerOptions = {}) {
    this.mockResult = options.mockResult ?? {
      ...DEFAULT_MOCK_RESULT,
      run: { ...DEFAULT_MOCK_RESULT.run },
    };
    this.shouldFailValidation = options.shouldFailValidation ?? false;
    this.validationErrorMessage =
      options.validationErrorMessage ??
      'FakeCodeRunner simulated runtime validation failure';
  }

  public setMockResult(result: RunCodeResult): void {
    this.mockResult = result;
  }

  public setShouldFailValidation(
    shouldFail: boolean,
    errorMessage?: string
  ): void {
    this.shouldFailValidation = shouldFail;
    if (errorMessage !== undefined) {
      this.validationErrorMessage = errorMessage;
    }
  }

  public reset(): void {
    this.lastInput = null;
    this.executedInputs.length = 0;
    this.shouldFailValidation = false;
    this.mockResult = {
      ...DEFAULT_MOCK_RESULT,
      run: { ...DEFAULT_MOCK_RESULT.run },
    };
  }

  public async run(input: RunCodeInput): Promise<RunCodeResult> {
    this.lastInput = input;
    this.executedInputs.push(input);
    return this.mockResult;
  }

  public async validateRuntimes(): Promise<void> {
    if (this.shouldFailValidation) {
      throw new PistonInfrastructureError(this.validationErrorMessage);
    }
  }
}
