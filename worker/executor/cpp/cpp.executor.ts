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

const IMAGE = 'executor-cpp:latest';
// C++ is the highest-risk language (system(), fork(), exec(), /proc access),
// so it gets a tighter pids-limit than the DockerRunner default.
const CPP_PIDS_LIMIT = 32;
// Compilation itself has no test-input dependency, give it a fixed
// generous budget instead of the (possibly very short) per-test timeout.
const COMPILE_TIMEOUT_MS = 15_000;

const COMPILE_SCRIPT = `#!/bin/sh
g++ -std=c++17 -O0 -o /code/solution /code/solution.cpp
exit $?
`;

const RUN_SCRIPT = `#!/bin/sh
/code/solution
exit $?
`;

export class CppExecutor implements LanguageExecutor {
  readonly language = 'cpp' as const;

  constructor(
    private readonly dockerRunner: DockerRunner = new DockerRunner()
  ) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `cpp-${input.submissionId}-`)
    );

    try {
      // mkdtemp creates the directory with mode 0700 owned by the host
      // user, but the container runs as uid 1001 (non-root `executor`).
      // Open it up so the container can read solution.cpp and write the
      // compiled binary into /code.
      await fs.chmod(tmpDir, 0o777);

      await fs.writeFile(path.join(tmpDir, 'solution.cpp'), input.code, {
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
        pidsLimit: CPP_PIDS_LIMIT,
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
          pidsLimit: CPP_PIDS_LIMIT,
          stdin: tc.input,
        });
        const runtimeMs = Date.now() - start;
        totalRuntimeMs += runtimeMs;

        let status: TestCaseStatus;
        let actualOutput = '';

        if (timedOut) {
          status = 'time_limit_exceeded';
        } else if (exitCode !== 0) {
          // Non-zero exit after a successful compile means a crash
          // (segfault, abort, uncaught exception, etc.)
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
