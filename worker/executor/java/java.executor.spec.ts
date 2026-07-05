import { JavaExecutor } from './java.executor';
import type { DockerRunner, DockerRunResult } from '../docker-runner';
import type { ExecutorInput } from '../executor.interface';

const okResult = (
  overrides: Partial<DockerRunResult> = {}
): DockerRunResult => ({
  stdout: '',
  stderr: '',
  exitCode: 0,
  timedOut: false,
  ...overrides,
});

const buildInput = (overrides: Partial<ExecutorInput> = {}): ExecutorInput => ({
  submissionId: 'sub-123',
  code: 'public class Solution { public static void main(String[] args) {} }',
  language: 'java',
  testCases: [{ id: 'tc-1', input: '2 3', expectedOutput: '5' }],
  timeoutMs: 2000,
  memoryMb: 128,
  ...overrides,
});

describe('JavaExecutor', () => {
  let mockRun: jest.Mock;
  let runner: DockerRunner;
  let executor: JavaExecutor;

  beforeEach(() => {
    mockRun = jest.fn();
    runner = { run: mockRun } as unknown as DockerRunner;
    executor = new JavaExecutor(runner);
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
        stderr: "Solution.java:1: error: ';' expected",
      })
    );

    const result = await executor.execute(buildInput());

    expect(result.status).toBe('compile_error');
    expect(result.compileError).toContain("';' expected");
    expect(result.testCaseResults).toHaveLength(0);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('maps a non-zero exit code after a successful compile to "runtime_error"', async () => {
    mockRun
      .mockResolvedValueOnce(okResult()) // compile ok
      .mockResolvedValueOnce(okResult({ exitCode: 1 })); // uncaught exception

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
  });

  it('forwards stdin and the per-test timeout/memory to the DockerRunner', async () => {
    mockRun
      .mockResolvedValueOnce(okResult())
      .mockResolvedValueOnce(okResult({ stdout: '5\n' }));

    await executor.execute(buildInput());

    expect(mockRun).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        image: 'executor-java:latest',
      })
    );
    expect(mockRun).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        image: 'executor-java:latest',
        stdin: '2 3',
        timeoutMs: 2000,
        memoryMb: 128,
      })
    );
  });

  it('propagates DockerRunner failures instead of swallowing them', async () => {
    mockRun.mockRejectedValueOnce(new Error('docker daemon not running'));

    await expect(executor.execute(buildInput())).rejects.toThrow(
      'docker daemon not running'
    );
  });
});
