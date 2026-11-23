import { promises as fs } from 'fs';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { PythonExecutor } from './python.executor';
import { DockerRunner, DockerRunOutput } from '../docker.runner';
import { ExecutorInput } from '../executor.interface';

vi.mock('fs', () => ({
  promises: {
    mkdtemp: vi.fn().mockResolvedValue('/tmp/mock-dir'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('PythonExecutor', () => {
  let dockerRunner: Mocked<DockerRunner>;
  let executor: PythonExecutor;

  const mockInput: ExecutorInput = {
    submissionId: 'sub-123',
    code: 'print("Hello")',
    timeoutMs: 1000,
    memoryMb: 256,
    testCases: [{ id: 'tc-1', input: '', expectedOutput: 'Hello\n' }],
  };

  beforeEach(() => {
    dockerRunner = {
      run: vi.fn(),
    } as unknown as Mocked<DockerRunner>;
    executor = new PythonExecutor(dockerRunner);
    vi.clearAllMocks();
  });

  it('should call DockerRunner with the correct execution and security parameters', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'Hello\n',
      stderr: '',
      exitCode: 0,
    } as DockerRunOutput);

    await executor.execute(mockInput);

    expect(dockerRunner.run).toHaveBeenCalledWith(
      expect.objectContaining({
        image: 'executor-python:latest',
        command: ['python3', 'main.py'],
        tmpDir: '/tmp/mock-dir',
        timeoutMs: 1000,
        memoryMb: 256,
        stdin: '',
        networkDisabled: true,
        readOnly: true,
        pidsLimit: 100,
        user: '1000',
        dropPrivileges: true,
        cpus: 1,
      })
    );
  });

  it('should return success when actual output matches expected output', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'Hello\n',
      stderr: '',
      exitCode: 0,
    } as DockerRunOutput);

    const result = await executor.execute(mockInput);

    expect(result.testCaseResults[0]!.status!).toBe('success');
    expect(result.testCaseResults[0]!.passed!).toBe(true);
    expect(fs.rm).toHaveBeenCalledWith('/tmp/mock-dir', {
      recursive: true,
      force: true,
    });
  });

  it('should return runtime_error when exitCode is non-zero', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: '',
      stderr: 'NameError: name "x" is not defined',
      exitCode: 1,
    } as DockerRunOutput);

    const result = await executor.execute(mockInput);

    expect(result.testCaseResults[0]!.status!).toBe('runtime_error');
    expect(result.testCaseResults[0]!.passed!).toBe(false);
  });

  it('should return time_limit_exceeded when timeoutTriggered is true', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: '',
      stderr: '',
      exitCode: 137,
      timeoutTriggered: true,
    } as DockerRunOutput);

    const result = await executor.execute(mockInput);

    expect(result.testCaseResults[0]!.status!).toBe('time_limit_exceeded');
  });

  it('should clean up temporary directory even if Docker runner throws an error', async () => {
    dockerRunner.run.mockRejectedValueOnce(
      new Error('Docker daemon not found')
    );

    await expect(executor.execute(mockInput)).rejects.toThrow(
      'Docker daemon not found'
    );
    expect(fs.rm).toHaveBeenCalledWith('/tmp/mock-dir', {
      recursive: true,
      force: true,
    });
  });
});
