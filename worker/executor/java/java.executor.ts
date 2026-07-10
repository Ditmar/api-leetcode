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
const MAX_SOURCE_SIZE_BYTES = 100 * 1024
const JAVA_COMPILE_PIDS_LIMIT = 128;
const JAVA_RUN_PIDS_LIMIT = 48;
const COMPILE_TIMEOUT_MS = 15_000;
const COMPILE_SCRIPT = `#!/bin/sh
javac -d /code /code/Solution.java
exit $?
`;

function buildRunScript(memoryMb: number): string {
  const heapMb = Math.max(16, Math.floor(memoryMb * 0.75));
  return `#!/bin/sh
java -Xmx${heapMb}m -cp /code Solution < /code/input.txt
exit $?
`;
}

export class JavaExecutor implements LanguageExecutor {
  readonly language = 'java' as const;

  constructor(
    private readonly dockerRunner: DockerRunner = new DockerRunner()
  ) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const sourceSizeBytes = Buffer.byteLength(input.code, 'utf8');
    if (sourceSizeBytes > MAX_SOURCE_SIZE_BYTES) {
      throw new RangeError(
        `Source code is ${sourceSizeBytes} bytes, which exceeds the ` +
          `${MAX_SOURCE_SIZE_BYTES}-byte limit`
      );
    }

    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `java-${input.submissionId}-`)
    );

    try {
      return await this.runInSandbox(input, tmpDir);
    } catch (err) {
      return {
        status: 'infra_error',
        testCaseResults: [],
        totalRuntimeMs: 0,
        peakMemoryMb: 0,
        infraError: err instanceof Error ? err.message : String(err),
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }

  private async runInSandbox(
    input: ExecutorInput,
    tmpDir: string
  ): Promise<ExecutorOutput> {
    await fs.writeFile(path.join(tmpDir, 'Solution.java'), input.code, {
      mode: 0o644,
    });
    await fs.writeFile(path.join(tmpDir, 'compile.sh'), COMPILE_SCRIPT, {
      mode: 0o755,
    });
    await fs.writeFile(
      path.join(tmpDir, 'run.sh'),
      buildRunScript(input.memoryMb),
      { mode: 0o755 }
    );

    const compileResult = await this.dockerRunner.run({
      image: IMAGE,
      command: ['sh', '/code/compile.sh'],
      tmpDir,
      timeoutMs: COMPILE_TIMEOUT_MS,
      memoryMb: input.memoryMb,
      pidsLimit: JAVA_COMPILE_PIDS_LIMIT,
    });

    if (compileResult.exitCode !== 0) {
      return {
        status: 'compile_error',
        testCaseResults: [],
        totalRuntimeMs: 0,
        peakMemoryMb: 0,
        compileError: compileResult.stderr || 'Compilation failed',
      };
    }

    const testCaseResults: TestCaseResult[] = [];
    let totalRuntimeMs = 0;
    let overallStatus: ExecutorOutput['status'] = 'accepted';

    for (const tc of input.testCases) {
      await fs.writeFile(path.join(tmpDir, 'input.txt'), tc.input);

      const start = Date.now();
      const { stdout, exitCode, timedOut } = await this.dockerRunner.run({
        image: IMAGE,
        command: ['sh', '/code/run.sh'],
        tmpDir,
        timeoutMs: input.timeoutMs,
        memoryMb: input.memoryMb,
        pidsLimit: JAVA_RUN_PIDS_LIMIT,
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
      peakMemoryMb: 0,
    };
  }
}
