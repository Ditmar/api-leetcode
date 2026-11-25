/**
 * Unit tests for CppExecutor (API-EXE-004).
 *
 * The DockerRunner is fully mocked, so these tests run without Docker
 * and can be executed in the CI pipeline.
 */
import fs from 'fs/promises';
import { CppExecutor } from './cpp.executor';
import type { DockerRunner, DockerRunResult } from '../docker-runner';
import type { ExecutorInput } from '../executor.interface';

const okResult = (overrides: Partial<DockerRunResult> = {}): DockerRunResult => ({
  stdout: '',
  stderr: '',
  exitCode: 0,
  timedOut: false,
  outputTruncated: false,
  ...overrides,
});

const buildInput = (overrides: Partial<ExecutorInput> = {}): ExecutorInput => ({
  submissionId: 'sub-123',
  code: '#include <iostream>\nint main() { return 0; }',
  language: 'cpp',
  testCases: [{ id: 'tc-1', input: '2 3', expectedOutput: '5' }],
  timeoutMs: 2000,
  memoryMb: 128,
  ...overrides,
});

describe('CppExecutor', () => {
  let mockRun: jest.Mock;
  let runner: DockerRunner;
  let executor: CppExecutor;

  beforeEach(() => {
    mockRun = jest.fn();
    runner = { run: mockRun } as unknown as DockerRunner;
    executor = new CppExecutor(runner);
  });

  it('normalizes CRLF and trailing spaces when comparing (does not flag wrong answer false)', async () => {
  // compile ok, then a run whose stdout has \r\n and spaces at the end of the line
  mockRun
    .mockResolvedValueOnce(okResult({ exitCode: 0 })) // compile
    .mockResolvedValueOnce(okResult({ stdout: '4 \r\n2 \r\n' })); // run

  const input = buildInput({
    testCases: [{ id: 'tc1', input: '', expectedOutput: '4\n2' }],
  });

  const result = await executor.execute(input);

  expect(result.status).toBe('accepted');
});

  it('returns "accepted" when compilation succeeds and output matches', async () => {
    mockRun
      .mockResolvedValueOnce(okResult()) // compile step
      .mockResolvedValueOnce(okResult({ stdout: '5\n' })); // run step

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('accepted');
    expect(result.testCaseResults).toHaveLength(1);
    expect(result.testCaseResults[0]?.passed).toBe(true);
    expect(result.testCaseResults[0]?.status).toBe('passed');
    expect(result.testCaseResults[0]?.actualOutput).toBe('5');
    expect(result.compileError).toBeUndefined();
  });

  it('returns "compile_error" with the compiler message and runs no test cases', async () => {
    mockRun.mockResolvedValueOnce(
      okResult({
        exitCode: 1,
        stderr: "solution.cpp:4:1: error: expected ';' before '}' token",
      })
    );

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('compile_error');
    expect(result.compileError).toContain("expected ';'");
    expect(result.testCaseResults).toHaveLength(0);
    // Only the compile step ran — never a test-case run.
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('maps a non-zero exit code after a successful compile to "runtime_error"', async () => {
    mockRun
      .mockResolvedValueOnce(okResult()) // compile ok
      .mockResolvedValueOnce(okResult({ exitCode: 139 })); // segfault

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('runtime_error');
    expect(result.testCaseResults[0]?.status).toBe('runtime_error');
    expect(result.testCaseResults[0]?.passed).toBe(false);
    expect(result.testCaseResults[0]?.actualOutput).toBe('');
  });

  it('maps a killed container to "time_limit_exceeded"', async () => {
    mockRun
      .mockResolvedValueOnce(okResult()) // compile ok
      .mockResolvedValueOnce(okResult({ exitCode: 137, timedOut: true }));

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('time_limit_exceeded');
    expect(result.testCaseResults[0]?.status).toBe('time_limit_exceeded');
    expect(result.testCaseResults[0]?.passed).toBe(false);
  });

  it('returns "wrong_answer" when the program runs fine but output differs', async () => {
    mockRun
      .mockResolvedValueOnce(okResult()) // compile ok
      .mockResolvedValueOnce(okResult({ stdout: '6\n' }));

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('wrong_answer');
    expect(result.testCaseResults[0]?.status).toBe('failed');
    expect(result.testCaseResults[0]?.actualOutput).toBe('6');
    expect(result.testCaseResults[0]?.expectedOutput).toBe('5');
  });

  it('evaluates every test case and reports the first failing status overall', async () => {
    const input = buildInput({
      testCases: [
        { id: 'tc-1', input: '2 3', expectedOutput: '5' },
        { id: 'tc-2', input: '10 20', expectedOutput: '30' },
      ],
    });

    mockRun
      .mockResolvedValueOnce(okResult()) // compile ok
      .mockResolvedValueOnce(okResult({ stdout: '5\n' })) // tc-1 passes
      .mockResolvedValueOnce(okResult({ stdout: '31\n' })); // tc-2 fails

    const result = await executor.execute(input);

    expect(result.status).toBe('wrong_answer');
    expect(result.testCaseResults).toHaveLength(2);
    expect(result.testCaseResults[0]?.passed).toBe(true);
    expect(result.testCaseResults[1]?.passed).toBe(false);
    expect(mockRun).toHaveBeenNthCalledWith(1, expect.objectContaining({ image: 'executor-cpp:latest', pidsLimit: 128 }));
   });

  it('forwards the C++ sandbox hardening (pids-limit 32) and writes the test-case input to a file instead of piping stdin live', async () => {
    const writeFileSpy = jest.spyOn(fs, 'writeFile');
    mockRun
      .mockResolvedValueOnce(okResult())
      .mockResolvedValueOnce(okResult({ stdout: '5\n' }));

    await executor.execute(buildInput());

    // Compile step: looser pids limit (g++ forks cc1plus/as/ld/collect2),
    // no stdin.
    expect(mockRun).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        image: 'executor-cpp:latest',
        pidsLimit: 128,
      })
    );
    // Run step: same hardening plus the per-test timeout. No `stdin` field
    // anymore — docker run -i is unreliable on Docker Desktop for
    // Windows/WSL2 when the writer isn't a real terminal (see
    // docker-runner.ts), so input travels via a bind-mounted file instead.
    expect(mockRun).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        image: 'executor-cpp:latest',
        pidsLimit: 32,
        timeoutMs: 2000,
        memoryMb: 128,
      })
    );
    expect(mockRun.mock.calls[1][0]).not.toHaveProperty('stdin');

    // The test case's input ("2 3") gets written to input.txt, which
    // run.sh redirects into the compiled binary's stdin.
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringContaining('input.txt'),
      '2 3'
    );

    writeFileSpy.mockRestore();
  });

  it('resolves with "infra_error" instead of a rejected promise when DockerRunner fails', async () => {
    mockRun.mockRejectedValueOnce(new Error('docker daemon not running'));

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('infra_error');
    expect(result.infraError).toBe('docker daemon not running');
    expect(result.testCaseResults).toHaveLength(0);
  });

  it('rejects source code larger than the configured size limit before touching Docker', async () => {
    const oversizedCode = 'a'.repeat(101 * 1024); // > 100 KB
    const input = buildInput({ code: oversizedCode });

    await expect(executor.execute(input)).rejects.toThrow(/exceeds the/);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('accepts source code right at the size limit', async () => {
    mockRun
      .mockResolvedValueOnce(okResult())
      .mockResolvedValueOnce(okResult({ stdout: '5\n' }));

    const codeAtLimit = 'a'.repeat(100 * 1024); // exactly 100 KB
    const result = await executor.execute(buildInput({ code: codeAtLimit }));

    expect(result.status).toBe('accepted');
  });
});
