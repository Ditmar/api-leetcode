/* eslint-env jest */
/// <reference types="jest" />

import { configSchema } from '../../config/config-schema';
import type { RunCodeResult } from '../../domain/code-runner/code-runner.interface';
import { FakeCodeRunner } from './fake-code-runner';
import {
  PistonCodeRunner,
  PistonInfrastructureError,
  PistonValidationError,
} from './piston-code-runner';

const createJsonResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }) as unknown as Response;

describe('PistonCodeRunner', () => {
  const defaultLanguageMap = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
  };

  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
  });

  const createRunner = (
    overrides: Partial<ConstructorParameters<typeof PistonCodeRunner>[0]> = {}
  ): PistonCodeRunner =>
    new PistonCodeRunner({
      pistonUrl: 'http://localhost:2000',
      compileTimeoutMs: 10000,
      runTimeoutMs: 5000,
      memoryLimitBytes: 128 * 1024 * 1024,
      maxOutputSizeBytes: 64 * 1024,
      maxCodeSizeBytes: 64 * 1024,
      languageMap: defaultLanguageMap,
      maxRetries: 2,
      retryDelayMs: 1,
      fetchFn: mockFetch,
      ...overrides,
    });

  describe('Successful executions (JavaScript & Python)', () => {
    it('executes JavaScript code successfully and maps response with wallTimeMs', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'javascript',
          version: '18.15.0',
          run: {
            stdout: '42\n',
            stderr: '',
            code: 0,
            signal: null,
            output: '42\n',
            memory: 16384,
          },
        })
      );

      const runner = createRunner({ pistonToken: 'secret-proxy-token' });
      const result = await runner.run({
        language: 'javascript',
        files: [{ name: 'solution.js', content: 'console.log(40 + 2);' }],
        stdin: '',
        args: ['--fast'],
      });

      expect(result.status).toBe('success');
      expect(result.run.stdout).toBe('42\n');
      expect(result.run.stderr).toBe('');
      expect(result.run.code).toBe(0);
      expect(result.run.signal).toBeNull();
      expect(typeof result.wallTimeMs).toBe('number');
      expect(result.wallTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.memoryUsedBytes).toBe(16384);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0]!;
      expect(calledUrl).toBe('http://localhost:2000/api/v2/execute');
      expect(calledInit?.method).toBe('POST');
      expect(calledInit?.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer secret-proxy-token',
      });

      const parsedBody = JSON.parse(calledInit?.body as string);
      expect(parsedBody).toEqual({
        language: 'javascript',
        version: '18.15.0',
        files: [{ name: 'solution.js', content: 'console.log(40 + 2);' }],
        stdin: '',
        args: ['--fast'],
        compile_timeout: 10000,
        run_timeout: 5000,
        compile_memory_limit: 128 * 1024 * 1024,
        run_memory_limit: 128 * 1024 * 1024,
      });
    });

    it('executes Python code successfully with stdin and custom execution limits', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'python',
          version: '3.10.0',
          run: {
            stdout: 'Hello Piston\n',
            stderr: '',
            code: 0,
            signal: null,
            output: 'Hello Piston\n',
          },
        })
      );

      const runner = createRunner();
      const result = await runner.run({
        language: 'python',
        files: [{ name: 'main.py', content: 'print(input())' }],
        stdin: 'Hello Piston',
        limits: {
          runTimeoutMs: 3000,
          memoryLimitBytes: 64 * 1024 * 1024,
        },
      });

      expect(result.status).toBe('success');
      expect(result.run.stdout).toBe('Hello Piston\n');
      expect(result.run.code).toBe(0);

      const [, calledInit] = mockFetch.mock.calls[0]!;
      const parsedBody = JSON.parse(calledInit?.body as string);
      expect(parsedBody.language).toBe('python');
      expect(parsedBody.version).toBe('3.10.0');
      expect(parsedBody.stdin).toBe('Hello Piston');
      expect(parsedBody.run_timeout).toBe(3000);
      expect(parsedBody.run_memory_limit).toBe(64 * 1024 * 1024);
    });
  });

  describe('Signal and status mapping', () => {
    it('maps SIGKILL signal to time_limit_exceeded', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'python',
          version: '3.10.0',
          run: {
            stdout: '',
            stderr: '',
            code: null,
            signal: 'SIGKILL',
            output: '',
          },
        })
      );

      const runner = createRunner();
      const result = await runner.run({
        language: 'python',
        files: [{ content: 'while True: pass' }],
      });

      expect(result.status).toBe('time_limit_exceeded');
      expect(result.run.signal).toBe('SIGKILL');
    });

    it('maps SIGTERM, SIGXCPU, and timeout stderr messages to time_limit_exceeded', async () => {
      mockFetch
        .mockResolvedValueOnce(
          createJsonResponse({
            language: 'javascript',
            version: '18.15.0',
            run: {
              stdout: '',
              stderr: '',
              code: null,
              signal: 'SIGXCPU',
            },
          })
        )
        .mockResolvedValueOnce(
          createJsonResponse({
            language: 'javascript',
            version: '18.15.0',
            run: {
              stdout: '',
              stderr: 'Execution timed out after 5000ms',
              code: 124,
              signal: null,
            },
          })
        );

      const runner = createRunner();

      const sigxcpuResult = await runner.run({
        language: 'javascript',
        files: [{ content: 'for (;;) {}' }],
      });
      expect(sigxcpuResult.status).toBe('time_limit_exceeded');

      const stderrTimeoutResult = await runner.run({
        language: 'javascript',
        files: [{ content: 'for (;;) {}' }],
      });
      expect(stderrTimeoutResult.status).toBe('time_limit_exceeded');
    });

    it('maps non-zero compile exit code to compile_error', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'javascript',
          version: '18.15.0',
          compile: {
            stdout: '',
            stderr: 'SyntaxError: Unexpected token',
            code: 1,
            signal: null,
          },
          run: {
            stdout: '',
            stderr: '',
            code: 0,
            signal: null,
          },
        })
      );

      const runner = createRunner();
      const result = await runner.run({
        language: 'javascript',
        files: [{ content: 'const x = ;' }],
      });

      expect(result.status).toBe('compile_error');
      expect(result.compile?.code).toBe(1);
      expect(result.compile?.stderr).toContain('SyntaxError');
    });

    it('maps non-zero run exit code (without timeout) to runtime_error', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'python',
          version: '3.10.0',
          run: {
            stdout: '',
            stderr: 'ZeroDivisionError: division by zero',
            code: 1,
            signal: null,
          },
        })
      );

      const runner = createRunner();
      const result = await runner.run({
        language: 'python',
        files: [{ content: 'print(1 / 0)' }],
      });

      expect(result.status).toBe('runtime_error');
      expect(result.run.code).toBe(1);
    });

    it('truncates stdout exceeding PISTON_MAX_OUTPUT_SIZE_BYTES and sets status to output_limit_exceeded', async () => {
      const maxOutputBytes = 64 * 1024;
      const hugeStdout = 'x'.repeat(maxOutputBytes + 1024);

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'python',
          version: '3.10.0',
          run: {
            stdout: hugeStdout,
            stderr: '',
            code: 0,
            signal: null,
          },
        })
      );

      const runner = createRunner({ maxOutputSizeBytes: maxOutputBytes });
      const result = await runner.run({
        language: 'python',
        files: [{ content: 'print("x" * 70000)' }],
      });

      expect(result.status).toBe('output_limit_exceeded');
      expect(Buffer.byteLength(result.run.stdout, 'utf8')).toBe(maxOutputBytes);
    });
  });

  describe('Input & code size validation', () => {
    it('immediately rejects code exceeding PISTON_MAX_CODE_SIZE_BYTES (64 KB) without calling fetch', async () => {
      const runner = createRunner({ maxCodeSizeBytes: 64 * 1024 });
      const oversizedCode = 'a'.repeat(64 * 1024 + 1);

      await expect(
        runner.run({
          language: 'javascript',
          files: [{ content: oversizedCode }],
        })
      ).rejects.toThrow(PistonValidationError);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('immediately rejects unconfigured languages without calling fetch', async () => {
      const runner = createRunner();

      await expect(
        runner.run({
          language: 'cobol',
          files: [{ content: 'DISPLAY "HELLO".' }],
        })
      ).rejects.toThrow(PistonValidationError);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Retry policy and infrastructure error differentiation', () => {
    it('retries up to 2 times (3 total attempts) on HTTP 500 errors and throws PistonInfrastructureError when all fail', async () => {
      mockFetch
        .mockResolvedValueOnce(createJsonResponse('Internal Server Error', 500))
        .mockResolvedValueOnce(createJsonResponse('Bad Gateway', 502))
        .mockResolvedValueOnce(createJsonResponse('Service Unavailable', 503));

      const runner = createRunner({ maxRetries: 2, retryDelayMs: 1 });

      await expect(
        runner.run({
          language: 'javascript',
          files: [{ content: 'console.log(1);' }],
        })
      ).rejects.toThrow(PistonInfrastructureError);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('recovers and returns result when Piston fails with 500 once and succeeds on retry', async () => {
      mockFetch
        .mockResolvedValueOnce(createJsonResponse('Internal Server Error', 500))
        .mockResolvedValueOnce(
          createJsonResponse({
            language: 'javascript',
            version: '18.15.0',
            run: {
              stdout: 'recovered\n',
              stderr: '',
              code: 0,
              signal: null,
            },
          })
        );

      const runner = createRunner({ maxRetries: 2, retryDelayMs: 1 });
      const result = await runner.run({
        language: 'javascript',
        files: [{ content: 'console.log("recovered");' }],
      });

      expect(result.status).toBe('success');
      expect(result.run.stdout).toBe('recovered\n');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('retries up to 2 times on network connection errors and throws PistonInfrastructureError if Piston stays down', async () => {
      mockFetch.mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));

      const runner = createRunner({ maxRetries: 2, retryDelayMs: 1 });

      await expect(
        runner.run({
          language: 'python',
          files: [{ content: 'print(1)' }],
        })
      ).rejects.toThrow(PistonInfrastructureError);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('NEVER retries when user code fails at compile time or runtime', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          language: 'python',
          version: '3.10.0',
          run: {
            stdout: '',
            stderr: 'RuntimeError: boom',
            code: 1,
            signal: null,
          },
        })
      );

      const runner = createRunner({ maxRetries: 2, retryDelayMs: 1 });
      const result = await runner.run({
        language: 'python',
        files: [{ content: 'raise RuntimeError("boom")' }],
      });

      expect(result.status).toBe('runtime_error');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateRuntimes()', () => {
    it('resolves when all languages in PISTON_LANGUAGE_MAP are present in Piston', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse([
          {
            language: 'javascript',
            version: '18.15.0',
            aliases: ['js', 'node-javascript'],
          },
          {
            language: 'python',
            version: '3.10.0',
            aliases: ['py', 'python3'],
          },
        ])
      );

      const runner = createRunner();
      await expect(runner.validateRuntimes()).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:2000/api/v2/runtimes',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('throws PistonInfrastructureError when a configured runtime is missing in Piston', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse([
          {
            language: 'javascript',
            version: '18.15.0',
            aliases: ['js'],
          },
        ])
      );

      const runner = createRunner();
      await expect(runner.validateRuntimes()).rejects.toThrow(
        PistonInfrastructureError
      );
    });

    it('throws PistonInfrastructureError when Piston runtimes endpoint is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

      const runner = createRunner();
      await expect(runner.validateRuntimes()).rejects.toThrow(
        PistonInfrastructureError
      );
    });
  });
});

describe('FakeCodeRunner', () => {
  it('returns configured mockResult and records lastInput without network calls', async () => {
    const fakeRunner = new FakeCodeRunner();
    const customResult: RunCodeResult = {
      status: 'time_limit_exceeded',
      run: {
        stdout: 'partial',
        stderr: '',
        code: null,
        signal: 'SIGKILL',
      },
      wallTimeMs: 5002,
    };

    fakeRunner.setMockResult(customResult);

    const input = {
      language: 'python',
      files: [{ name: 'main.py', content: 'while True: pass' }],
      stdin: 'test-input',
    };

    const result = await fakeRunner.run(input);

    expect(result).toEqual(customResult);
    expect(fakeRunner.lastInput).toEqual(input);
    expect(fakeRunner.executedInputs).toHaveLength(1);
  });

  it('simulates validateRuntimes() failure when shouldFailValidation flag is enabled', async () => {
    const fakeRunner = new FakeCodeRunner();
    await expect(fakeRunner.validateRuntimes()).resolves.toBeUndefined();

    fakeRunner.setShouldFailValidation(true, 'Missing python@3.10.0 runtime');
    await expect(fakeRunner.validateRuntimes()).rejects.toThrow(
      PistonInfrastructureError
    );
    await expect(fakeRunner.validateRuntimes()).rejects.toThrow(
      'Missing python@3.10.0 runtime'
    );
  });
});

describe('Config Schema (Piston settings)', () => {
  it('applies default Piston values when omitted and validates PISTON_URL', () => {
    const parsed = configSchema.parse({
      app: { port: 3000, nodeEnv: 'test' },
      database: { url: 'postgres://user:pass@localhost:5432/db' },
      JWT: {
        secret: '1234567890',
        expiresIn: 30000,
        saltRounds: 10,
        refreshTokenSecret: '1234567890',
        refreshTokenExpiresIn: 60000,
      },
    });

    expect(parsed.PISTON_URL).toBe('http://localhost:2000');
    expect(parsed.PISTON_TOKEN).toBeUndefined();
    expect(parsed.PISTON_COMPILE_TIMEOUT_MS).toBe(10000);
    expect(parsed.PISTON_RUN_TIMEOUT_MS).toBe(5000);
    expect(parsed.PISTON_MEMORY_LIMIT_BYTES).toBe(128 * 1024 * 1024);
    expect(parsed.PISTON_MAX_OUTPUT_SIZE_BYTES).toBe(64 * 1024);
    expect(parsed.PISTON_MAX_CODE_SIZE_BYTES).toBe(64 * 1024);
    expect(parsed.PISTON_LANGUAGE_MAP).toEqual({
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
    });
  });
});
