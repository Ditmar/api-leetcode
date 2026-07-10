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
    (fsPromises.mkdtemp as jest.Mock).mockResolvedValue('/tmp/fake-dir');
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

  it('debería retornar wrong_answer cuando la salida no coincide', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'wrong output',
      stderr: '',
      exitCode: 0,
      timeoutTriggered: false,
    });

    const result = await executor.execute(mockInput);
    expect(result.testCaseResults[0]!.passed).toBe(false);
    expect(result.testCaseResults[0]!.status).toBe('wrong_answer');
  });

  it('debería retornar runtime_error cuando exitCode es distinto de 0', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: '',
      stderr: 'ReferenceError: x is not defined',
      exitCode: 1,
      timeoutTriggered: false,
    });

    const result = await executor.execute(mockInput);
    expect(result.testCaseResults[0]!.status).toBe('runtime_error');
  });

  it('debería retornar time_limit_exceeded cuando timeoutTriggered es true', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: '',
      stderr: '',
      exitCode: 124,
      timeoutTriggered: true,
    });

    const result = await executor.execute(mockInput);
    expect(result.testCaseResults[0]!.status).toBe('time_limit_exceeded');
  });

  it('debería limpiar el sistema de archivos al terminar', async () => {
    dockerRunner.run.mockResolvedValueOnce({
      stdout: 'ok',
      stderr: '',
      exitCode: 0,
      timeoutTriggered: false,
    });

    await executor.execute(mockInput);

    // Cambiamos el path esperado a '/tmp/fake-dir' que es lo que nuestro mock devuelve
    expect(fsPromises.rm).toHaveBeenCalledWith('/tmp/fake-dir', {
      recursive: true,
      force: true,
    });
  });
});
