import { promises as fs } from 'fs';
import path from 'path';
import {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
} from '../executor.interface';
import { DockerRunner } from '../docker.runner';

export class PythonExecutor implements LanguageExecutor {
  public readonly language = 'python';
  private readonly dockerImage = 'executor-python:latest';

  constructor(private readonly dockerRunner: DockerRunner) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const { submissionId, code, timeoutMs, memoryMb, testCases } = input;
    const tmpDir = await fs.mkdtemp(
      path.join('/tmp/', `python-${submissionId}-`)
    );

    try {
      await fs.writeFile(path.join(tmpDir, 'main.py'), code);

      const testCaseResults: TestCaseResult[] = [];
      let totalRuntimeMs = 0;

      for (const testCase of testCases) {
        const startTime = Date.now();

        const runOutput = await this.dockerRunner.run({
          image: this.dockerImage,
          command: ['python3', 'main.py'],
          tmpDir,
          timeoutMs,
          memoryMb,
          stdin: testCase.input,
          networkDisabled: true,
          readOnly: true,
          pidsLimit: 100,
          user: '1000',
          dropPrivileges: true,
          cpus: 1,
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
        peakMemoryMb: 0,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  private determineStatus(
    timeoutTriggered: boolean | undefined,
    exitCode: number,
    actualOutput: string,
    expectedOutput: string
  ): TestCaseResult['status'] {
    if (timeoutTriggered) return 'time_limit_exceeded';
    if (exitCode !== 0) return 'runtime_error';

    const normalize = (str: string) => str.trim().replace(/\r\n/g, '\n');
    return normalize(actualOutput) === normalize(expectedOutput)
      ? 'success'
      : 'wrong_answer';
  }
}
