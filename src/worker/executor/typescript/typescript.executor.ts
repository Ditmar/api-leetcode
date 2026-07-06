import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { DockerRunner } from '../docker.runner';
import type {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
} from '../executor.interface';

export class TypeScriptExecutor implements LanguageExecutor {
  readonly language = 'typescript' as const;

  constructor(private readonly dockerRunner: DockerRunner) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `ts-${input.submissionId}-`)
    );

    try {
      await fs.writeFile(path.join(tmpDir, 'solution.ts'), input.code);

      const dockerAssetsDir = path.resolve(
        __dirname,
        '../../../../docker/executor-ts'
      );

      await fs.copyFile(
        path.join(dockerAssetsDir, 'runner.ts'),
        path.join(tmpDir, 'runner.ts')
      );
      await fs.copyFile(
        path.join(dockerAssetsDir, 'entrypoint.sh'),
        path.join(tmpDir, 'entrypoint.sh')
      );

      const testCaseResults: TestCaseResult[] = [];
      let totalRuntimeMs = 0;

      for (const tc of input.testCases) {
        const start = Date.now();

        const { stdout, stderr, exitCode, timeoutTriggered } =
          await this.dockerRunner.run({
            image: 'executor-ts:latest',
            command: ['sh', '/code/entrypoint.sh'],
            tmpDir,
            timeoutMs: input.timeoutMs,
            memoryMb: input.memoryMb,
            stdin: tc.input,
          });

        const runtimeMs = Date.now() - start;
        totalRuntimeMs += runtimeMs;

        if (stderr.includes('COMPILE_ERROR') || exitCode === 1) {
          return {
            testCaseResults: [],
            totalRuntimeMs: 0,
            peakMemoryMb: 0,
            compileError: stderr.trim(),
          };
        }

        let status: TestCaseResult['status'] = 'success';
        let passed = false;

        if (timeoutTriggered) {
          status = 'time_limit_exceeded';
        } else if (exitCode !== 0) {
          status = 'runtime_error';
        } else {
          const actualOutput = stdout.trim();
          passed = actualOutput === tc.expectedOutput.trim();
          if (!passed) {
            status = 'wrong_answer';
          }
        }

        testCaseResults.push({
          testCaseId: tc.id,
          passed,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: stdout.trim(),
          runtimeMs,
          status,
        });
      }

      return {
        testCaseResults,
        totalRuntimeMs,
        peakMemoryMb: input.memoryMb,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
