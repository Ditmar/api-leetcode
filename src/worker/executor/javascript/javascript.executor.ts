import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import { DockerRunner } from '../docker.runner';
import {
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
} from '../executor.interface';

export class JavascriptExecutor {
  constructor(private readonly dockerRunner: DockerRunner) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const testCaseResults: TestCaseResult[] = [];
    let totalRuntimeMs = 0;

    // Directorio de trabajo aislado por envío
    const workspaceDir = `/tmp/submissions/${input.submissionId}`;
    const codeFilePath = join(workspaceDir, 'index.js');

    try {
      await mkdir(workspaceDir, { recursive: true });
      await writeFile(codeFilePath, input.code);

      for (const testCase of input.testCases) {
        const startTime = Date.now();

        const runOutput = await this.dockerRunner.run({
          image: 'node:20-alpine',
          command: ['node', 'index.js'],
          tmpDir: workspaceDir,
          timeoutMs: input.timeoutMs,
          memoryMb: input.memoryMb,
          stdin: testCase.input,
        });

        const runtimeMs = Date.now() - startTime;
        totalRuntimeMs += runtimeMs;

        let status: TestCaseResult['status'];
        let passed = false;

        const actualOutputTrimmed = runOutput.stdout
          .trim()
          .replace(/\r\n/g, '\n');
        const expectedOutputTrimmed = testCase.expectedOutput
          .trim()
          .replace(/\r\n/g, '\n');

        if (runOutput.timeoutTriggered) {
          status = 'time_limit_exceeded';
        } else if (runOutput.exitCode !== 0) {
          status = 'runtime_error';
        } else if (actualOutputTrimmed === expectedOutputTrimmed) {
          passed = true;
          status = 'success';
        } else {
          status = 'wrong_answer';
        }

        testCaseResults.push({
          testCaseId: testCase.id,
          passed,
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        testCaseResults: [],
        totalRuntimeMs: 0,
        peakMemoryMb: 0,
        compileError: `System Error: ${errorMessage}`,
      };
    } finally {
      await rm(workspaceDir, { recursive: true, force: true });
    }
  }
}
