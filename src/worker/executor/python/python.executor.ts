import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
} from '../executor.interface';
import { DockerRunner } from '../docker.runner';

export class PythonExecutor implements LanguageExecutor {
  public readonly language = 'python';
  private readonly dockerImage = 'executor-python';

  constructor(private readonly dockerRunner: DockerRunner) {}

  public async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const { code, timeoutMs, memoryMb, testCases } = input;

    // Create an isolated temporary directory for this execution
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'python-executor-'));
    const sourceFilePath = path.join(tmpDir, 'main.py');

    let totalRuntimeMs = 0;
    const testCaseResults: TestCaseResult[] = [];

    try {
      await fs.writeFile(sourceFilePath, code, 'utf-8');

      for (const testCase of testCases) {
        const startTime = Date.now();

        const runOutput = await this.dockerRunner.run({
          image: this.dockerImage,
          command: ['python3', 'main.py'],
          tmpDir,
          timeoutMs,
          memoryMb,
          stdin: testCase.input,
        });

        const runtimeMs = Date.now() - startTime;
        totalRuntimeMs += runtimeMs;

        const status = this.determineStatus(
          runOutput.timeoutTriggered,
          runOutput.exitCode,
          runOutput.stdout,
          testCase.expectedOutput
        );

        testCaseResults.push({
          testCaseId: testCase.id,
          passed: status === 'success',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: runOutput.stdout,
          runtimeMs,
          status,
        });
      }

      return {
        testCaseResults,
        totalRuntimeMs,
        peakMemoryMb: 0, // DockerRunner currently does not expose peak memory usage
      };
    } finally {
      // Ensure absolute cleanup of the temporary environment
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  private determineStatus(
    timeoutTriggered: boolean | undefined,
    exitCode: number,
    actualOutput: string,
    expectedOutput: string
  ): TestCaseResult['status'] {
    if (timeoutTriggered) {
      return 'time_limit_exceeded';
    }
    if (exitCode !== 0) {
      return 'runtime_error';
    }

    // Normalize line endings and trim spaces for fair comparison
    const normalize = (str: string) => str.trim().replace(/\r\n/g, '\n');

    if (normalize(actualOutput) === normalize(expectedOutput)) {
      return 'success';
    }
    return 'wrong_answer';
  }
}
