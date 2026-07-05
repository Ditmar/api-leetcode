import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { DockerRunner } from '../docker-runner';
import type {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
  TestCaseStatus,
} from '../executor.interface';

const IMAGE = 'executor-java:latest';

const COMPILE_TIMEOUT_MS = 15_000;

const COMPILE_SCRIPT = `#!/bin/sh
javac -d /code /code/Solution.java
exit $?
`;

const RUN_SCRIPT = `#!/bin/sh
java -cp /code Solution
exit $?
`;

export class JavaExecutor implements LanguageExecutor {
  readonly language = 'java' as const;

  constructor(
    private readonly dockerRunner: DockerRunner = new DockerRunner()
  ) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `java-${input.submissionId}-`)
    );

    try {

      await fs.chmod(tmpDir, 0o777);

      await fs.writeFile(path.join(tmpDir, 'Solution.java'), input.code, {
        mode: 0o644,
      });
      await fs.writeFile(path.join(tmpDir, 'compile.sh'), COMPILE_SCRIPT, {
        mode: 0o755,
      });
      await fs.writeFile(path.join(tmpDir, 'run.sh'), RUN_SCRIPT, {
        mode: 0o755,
      });

      const compileResult = await this.dockerRunner.run({
        image: IMAGE,
        command: ['sh', '/code/compile.sh'],
        tmpDir,
        timeoutMs: COMPILE_TIMEOUT_MS,
        memoryMb: input.memoryMb,
      });

      if (compileResult.exitCode !== 0) {
        return {
          status: 'compile_error',
          testCaseResults: [],
          totalRuntimeMs: 0,
          peakMemoryMb: 0,
          compileError: compileResult.stderr.trim() || 'Compilation failed',
        };
      }

      const testCaseResults: TestCaseResult[] = [];
      let totalRuntimeMs = 0;
      let overallStatus: ExecutorOutput['status'] = 'accepted';

      for (const tc of input.testCases) {
        const start = Date.now();
        const { stdout, exitCode, timedOut } = await this.dockerRunner.run({
          image: IMAGE,
          command: ['sh', '/code/run.sh'],
          tmpDir,
          timeoutMs: input.timeoutMs,
          memoryMb: input.memoryMb,
          stdin: tc.input,
        });
        const runtimeMs = Date.now() - start;
        totalRuntimeMs += runtimeMs;

        let status: TestCaseStatus;
        let actualOutput = '';

        if (timedOut) {
          status = 'time_limit_exceeded';
        } else if (exitCode !== 0) {

          status = 'runtime_error';
        } else {
          actualOutput = stdout.trim();
          status =
            actualOutput === tc.expectedOutput.trim() ? 'passed' : 'failed';
        }

        const passed = status === 'passed';

        testCaseResults.push({
          testCaseId: tc.id,
          passed,
          status,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          runtimeMs,
        });

        if (!passed && overallStatus === 'accepted') {
          if (status === 'failed') {
            overallStatus = 'wrong_answer';
          } else if (
            status === 'runtime_error' ||
            status === 'time_limit_exceeded'
          ) {
            overallStatus = status;
          }
        }
      }

      return {
        status: overallStatus,
        testCaseResults,
        totalRuntimeMs,
        peakMemoryMb: input.memoryMb,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
