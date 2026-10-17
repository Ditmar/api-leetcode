import { performance } from 'perf_hooks';
import { config } from '../../config/config';
import type { PistonLanguageMap } from '../../config/config-schema';
import type {
  CodeRunner,
  ExecutionStatus,
  RunCodeInput,
  RunCodeResult,
  StageResult,
} from '../../domain/code-runner/code-runner.interface';

export class PistonInfrastructureError extends Error {
  public readonly statusCode?: number;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options?: { statusCode?: number; cause?: unknown }
  ) {
    super(message);
    this.name = 'PistonInfrastructureError';
    this.statusCode = options?.statusCode;
    this.cause = options?.cause;
    Object.setPrototypeOf(this, PistonInfrastructureError.prototype);
  }
}

export class PistonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PistonValidationError';
    Object.setPrototypeOf(this, PistonValidationError.prototype);
  }
}

export interface PistonCodeRunnerOptions {
  pistonUrl?: string;
  pistonToken?: string;
  compileTimeoutMs?: number;
  runTimeoutMs?: number;
  memoryLimitBytes?: number;
  maxOutputSizeBytes?: number;
  maxCodeSizeBytes?: number;
  languageMap?: PistonLanguageMap;
  maxRetries?: number;
  retryDelayMs?: number;
  fetchFn?: typeof fetch;
}

interface PistonExecuteFilePayload {
  name?: string;
  content: string;
}

interface PistonExecuteRequestPayload {
  language: string;
  version: string;
  files: PistonExecuteFilePayload[];
  stdin: string;
  args: string[];
  compile_timeout: number;
  run_timeout: number;
  compile_memory_limit: number;
  run_memory_limit: number;
}

interface PistonStagePayload {
  stdout?: string;
  stderr?: string;
  code?: number | null;
  signal?: string | null;
  output?: string;
  memory?: number;
  message?: string | null;
  status?: string | null;
}

interface PistonExecuteResponsePayload {
  language: string;
  version: string;
  compile?: PistonStagePayload;
  run: PistonStagePayload;
}

interface PistonRuntimeItem {
  language: string;
  version: string;
  aliases?: string[];
  runtime?: string;
}

const TIMEOUT_SIGNALS = new Set(['SIGKILL', 'SIGTERM', 'SIGXCPU']);
const TIMEOUT_STDERR_PATTERN =
  /timed?\s*out|time\s*limit\s*exceeded|wall\s*time\s*limit/i;
const MEMORY_LIMIT_PATTERN =
  /memory\s*limit\s*exceeded|out\s*of\s*memory|MemoryError|std::bad_alloc|cannot\s*allocate\s*memory/i;

export class PistonCodeRunner implements CodeRunner {
  private readonly pistonUrl: string;
  private readonly pistonToken?: string;
  private readonly compileTimeoutMs: number;
  private readonly runTimeoutMs: number;
  private readonly memoryLimitBytes: number;
  private readonly maxOutputSizeBytes: number;
  private readonly maxCodeSizeBytes: number;
  private readonly languageMap: PistonLanguageMap;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: PistonCodeRunnerOptions = {}) {
    const rawUrl = options.pistonUrl ?? config.PISTON_URL;
    this.pistonUrl = rawUrl.replace(/\/+$/, '');
    this.pistonToken = options.pistonToken ?? config.PISTON_TOKEN;
    this.compileTimeoutMs =
      options.compileTimeoutMs ?? config.PISTON_COMPILE_TIMEOUT_MS;
    this.runTimeoutMs = options.runTimeoutMs ?? config.PISTON_RUN_TIMEOUT_MS;
    this.memoryLimitBytes =
      options.memoryLimitBytes ?? config.PISTON_MEMORY_LIMIT_BYTES;
    this.maxOutputSizeBytes =
      options.maxOutputSizeBytes ?? config.PISTON_MAX_OUTPUT_SIZE_BYTES;
    this.maxCodeSizeBytes =
      options.maxCodeSizeBytes ?? config.PISTON_MAX_CODE_SIZE_BYTES;
    this.languageMap = options.languageMap ?? config.PISTON_LANGUAGE_MAP;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 100;
    this.fetchFn =
      options.fetchFn ?? ((input, init) => global.fetch(input, init));
  }

  public async run(input: RunCodeInput): Promise<RunCodeResult> {
    this.validateInput(input);

    const languageConfig = this.languageMap[input.language]!;
    const compileTimeout =
      input.limits?.compileTimeoutMs ?? this.compileTimeoutMs;
    const runTimeout = input.limits?.runTimeoutMs ?? this.runTimeoutMs;
    const memoryLimit = input.limits?.memoryLimitBytes ?? this.memoryLimitBytes;
    const maxOutputSize =
      input.limits?.maxOutputSize ?? this.maxOutputSizeBytes;

    // Security rule: Never construct shell commands with user code.
    // Code is exclusively transmitted inside the JSON `files` array.
    const requestPayload: PistonExecuteRequestPayload = {
      language: languageConfig.language,
      version: languageConfig.version,
      files: input.files.map(file =>
        file.name !== undefined
          ? { name: file.name, content: file.content }
          : { content: file.content }
      ),
      stdin: input.stdin ?? '',
      args: input.args ?? [],
      compile_timeout: compileTimeout,
      run_timeout: runTimeout,
      compile_memory_limit: memoryLimit,
      run_memory_limit: memoryLimit,
    };

    const startWallTime = performance.now();
    const responsePayload = await this.executeWithRetry(
      `${this.pistonUrl}/api/v2/execute`,
      {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify(requestPayload),
      }
    );
    const wallTimeMs = Math.max(0, performance.now() - startWallTime);

    const compileNormalized = responsePayload.compile
      ? this.normalizeStage(responsePayload.compile, maxOutputSize)
      : undefined;
    const runNormalized = this.normalizeStage(
      responsePayload.run,
      maxOutputSize
    );

    const status = this.resolveExecutionStatus(
      responsePayload.compile,
      compileNormalized?.stageResult,
      compileNormalized?.outputTruncated ?? false,
      responsePayload.run,
      runNormalized.stageResult,
      runNormalized.outputTruncated
    );

    const result: RunCodeResult = {
      status,
      ...(compileNormalized ? { compile: compileNormalized.stageResult } : {}),
      run: runNormalized.stageResult,
      wallTimeMs,
      ...(typeof responsePayload.run.memory === 'number'
        ? { memoryUsedBytes: responsePayload.run.memory }
        : {}),
    };

    return result;
  }

  public async validateRuntimes(): Promise<void> {
    const url = `${this.pistonUrl}/api/v2/runtimes`;
    let response: Response;

    try {
      response = await this.fetchFn(url, {
        method: 'GET',
        headers: this.buildHeaders(false),
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new PistonInfrastructureError(
        `Unable to reach Piston runtimes endpoint at ${url}: ${detail}`,
        { cause: error }
      );
    }

    if (!response.ok) {
      const errorText = await this.safeReadText(response);
      throw new PistonInfrastructureError(
        `Piston runtimes validation failed with HTTP ${response.status}${
          errorText ? `: ${errorText}` : ''
        }`,
        { statusCode: response.status }
      );
    }

    let installedRuntimes: unknown;
    try {
      installedRuntimes = await response.json();
    } catch (error) {
      throw new PistonInfrastructureError(
        'Piston runtimes endpoint returned invalid JSON',
        { cause: error }
      );
    }

    if (!Array.isArray(installedRuntimes)) {
      throw new PistonInfrastructureError(
        'Piston runtimes endpoint did not return an array of runtimes'
      );
    }

    const runtimes = installedRuntimes as PistonRuntimeItem[];
    const missingRuntimes: string[] = [];

    for (const [languageKey, expected] of Object.entries(this.languageMap)) {
      const isInstalled = runtimes.some(runtime => {
        const matchesLanguage =
          runtime.language === expected.language ||
          (Array.isArray(runtime.aliases) &&
            runtime.aliases.includes(expected.language));
        const matchesVersion =
          expected.version === '*' || runtime.version === expected.version;
        return matchesLanguage && matchesVersion;
      });

      if (!isInstalled) {
        missingRuntimes.push(
          `${languageKey} (${expected.language}@${expected.version})`
        );
      }
    }

    if (missingRuntimes.length > 0) {
      throw new PistonInfrastructureError(
        `Missing required Piston runtime(s): ${missingRuntimes.join(', ')}`
      );
    }
  }

  private validateInput(input: RunCodeInput): void {
    if (!Array.isArray(input.files) || input.files.length === 0) {
      throw new PistonValidationError(
        'At least one code file must be provided for execution'
      );
    }

    const totalCodeSizeBytes = input.files.reduce(
      (total, file) => total + Buffer.byteLength(file.content ?? '', 'utf8'),
      0
    );

    if (totalCodeSizeBytes > this.maxCodeSizeBytes) {
      throw new PistonValidationError(
        `Total code size of ${totalCodeSizeBytes} bytes exceeds maximum allowed limit of ${this.maxCodeSizeBytes} bytes`
      );
    }

    if (!this.languageMap[input.language]) {
      const supported = Object.keys(this.languageMap).join(', ');
      throw new PistonValidationError(
        `Unsupported language "${input.language}". Configured languages: ${supported}`
      );
    }
  }

  private buildHeaders(
    includeJsonContentType: boolean
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.pistonToken && this.pistonToken.trim() !== '') {
      const token = this.pistonToken.trim();
      headers['Authorization'] = token.toLowerCase().startsWith('bearer ')
        ? token
        : `Bearer ${token}`;
    }

    return headers;
  }

  private async executeWithRetry(
    url: string,
    init: NonNullable<Parameters<typeof fetch>[1]>
  ): Promise<PistonExecuteResponsePayload> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      let response: Response;

      try {
        response = await this.fetchFn(url, init);
      } catch (error) {
        if (attempt < this.maxRetries) {
          await this.delay(this.calculateBackoffMs(attempt));
          continue;
        }
        const detail = error instanceof Error ? error.message : String(error);
        throw new PistonInfrastructureError(
          `Piston network request failed after ${attempt + 1} attempts: ${detail}`,
          { cause: error }
        );
      }

      if (response.status >= 500 && response.status < 600) {
        const errorText = await this.safeReadText(response);
        if (attempt < this.maxRetries) {
          await this.delay(this.calculateBackoffMs(attempt));
          continue;
        }
        throw new PistonInfrastructureError(
          `Piston server error (HTTP ${response.status}) after ${
            attempt + 1
          } attempts${errorText ? `: ${errorText}` : ''}`,
          { statusCode: response.status }
        );
      }

      if (!response.ok) {
        const errorText = await this.safeReadText(response);
        throw new PistonInfrastructureError(
          `Piston request rejected with HTTP ${response.status}${
            errorText ? `: ${errorText}` : ''
          }`,
          { statusCode: response.status }
        );
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch (error) {
        throw new PistonInfrastructureError(
          'Piston execute endpoint returned invalid JSON',
          { cause: error }
        );
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        !('run' in data) ||
        typeof (data as { run: unknown }).run !== 'object' ||
        (data as { run: unknown }).run === null
      ) {
        throw new PistonInfrastructureError(
          'Piston execute endpoint returned malformed execution result'
        );
      }

      return data as PistonExecuteResponsePayload;
    }

    throw new PistonInfrastructureError(
      'Exhausted retries while communicating with Piston'
    );
  }

  private normalizeStage(
    rawStage: PistonStagePayload,
    maxOutputSizeBytes: number
  ): { stageResult: StageResult; outputTruncated: boolean } {
    const rawStdout = rawStage.stdout ?? '';
    const rawStderr = rawStage.stderr ?? '';
    const stdoutResult = this.truncateUtf8(rawStdout, maxOutputSizeBytes);
    const outputResult =
      rawStage.output !== undefined
        ? this.truncateUtf8(rawStage.output, maxOutputSizeBytes)
        : undefined;

    const stageResult: StageResult = {
      stdout: stdoutResult.value,
      stderr: rawStderr,
      code: rawStage.code ?? null,
      signal: rawStage.signal ?? null,
      ...(outputResult !== undefined ? { output: outputResult.value } : {}),
    };

    return {
      stageResult,
      outputTruncated: stdoutResult.truncated,
    };
  }

  private truncateUtf8(
    value: string,
    maxBytes: number
  ): { value: string; truncated: boolean } {
    const byteLength = Buffer.byteLength(value, 'utf8');
    if (byteLength <= maxBytes) {
      return { value, truncated: false };
    }

    const truncatedBuffer = Buffer.from(value, 'utf8').subarray(0, maxBytes);
    return {
      value: truncatedBuffer.toString('utf8'),
      truncated: true,
    };
  }

  private resolveExecutionStatus(
    rawCompile: PistonStagePayload | undefined,
    compileStage: StageResult | undefined,
    compileOutputTruncated: boolean,
    rawRun: PistonStagePayload,
    runStage: StageResult,
    runOutputTruncated: boolean
  ): ExecutionStatus {
    if (compileStage && rawCompile) {
      if (compileOutputTruncated) {
        return 'output_limit_exceeded';
      }
      if (this.isTimeout(compileStage, rawCompile)) {
        return 'time_limit_exceeded';
      }
      if (this.isMemoryLimitExceeded(compileStage, rawCompile)) {
        return 'memory_limit_exceeded';
      }
      if (
        (compileStage.code !== null && compileStage.code !== 0) ||
        compileStage.signal !== null
      ) {
        return 'compile_error';
      }
    }

    if (runOutputTruncated) {
      return 'output_limit_exceeded';
    }

    if (this.isTimeout(runStage, rawRun)) {
      return 'time_limit_exceeded';
    }

    if (this.isMemoryLimitExceeded(runStage, rawRun)) {
      return 'memory_limit_exceeded';
    }

    if (
      (runStage.code !== null && runStage.code !== 0) ||
      runStage.signal !== null
    ) {
      return 'runtime_error';
    }

    return 'success';
  }

  private isTimeout(stage: StageResult, rawStage: PistonStagePayload): boolean {
    if (stage.signal !== null && TIMEOUT_SIGNALS.has(stage.signal)) {
      return true;
    }

    if (rawStage.status === 'TO') {
      return true;
    }

    const combinedDiagnostics = `${stage.stderr}\n${rawStage.message ?? ''}`;
    return TIMEOUT_STDERR_PATTERN.test(combinedDiagnostics);
  }

  private isMemoryLimitExceeded(
    stage: StageResult,
    rawStage: PistonStagePayload
  ): boolean {
    const combinedDiagnostics = `${stage.stderr}\n${rawStage.message ?? ''}`;
    return MEMORY_LIMIT_PATTERN.test(combinedDiagnostics);
  }

  private calculateBackoffMs(attempt: number): number {
    return this.retryDelayMs * Math.pow(2, attempt);
  }

  private async delay(ms: number): Promise<void> {
    if (ms <= 0) {
      return;
    }
    await new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  private async safeReadText(response: Response): Promise<string> {
    try {
      return (await response.text()).trim();
    } catch {
      return '';
    }
  }
}
