/* eslint-env jest */
import { JavascriptExecutor } from './javascript.executor';
import { DockerRunner } from '../docker.runner';
import { ExecutorInput } from '../executor.interface';
import * as fsPromises from 'fs/promises';

jest.mock('fs/promises');

describe('JavascriptExecutor', () => {
  let dockerRunner: jest.Mocked<DockerRunner>;
  let executor: JavascriptExecutor;

  const mockInput: ExecutorInput = {
    submissionId: 'sub-123',
    code: 'console.log("hello world");',
    timeoutMs: 1000,
    memoryMb: 128,
    testCases: [{ id: 'tc-1', input: '1 2', expectedOutput: 'hello world' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dockerRunner = {
      run: jest.fn(),
    } as unknown as jest.Mocked<DockerRunner>;
    executor = new JavascriptExecutor(dockerRunner);
  });

  it('debería retornar success cuando la salida coincide', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'hello world\n',
      stderr: '',
      exitCode: 0,
      timeoutTriggered: false,
    });

    const result = await executor.execute(mockInput);

    expect(result.testCaseResults[0]!.passed).toBe(true);
    expect(result.testCaseResults[0]!.status).toBe('success');
  });

  it('debería limpiar el sistema de archivos al terminar', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'ok',
      stderr: '',
      exitCode: 0,
    });

    await executor.execute(mockInput);

    expect(fsPromises.rm).toHaveBeenCalledWith('/tmp/submissions/sub-123', {
      recursive: true,
      force: true,
    });
  });
});
