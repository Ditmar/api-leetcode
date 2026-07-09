import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

const MAX_OUTPUT_BYTES = 1 * 1024 * 1024; // 1MB per stream

export interface DockerRunOptions {
  image: string;
  command: string[];
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  stdin?: string;
  pidsLimit?: number;
  cpus?: number;
}

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  stdoutTruncated?: boolean;
  stderrTruncated?: boolean;
}

export class DockerRunner {
  async run(options: DockerRunOptions): Promise<DockerRunResult> {
    const {
      image,
      command,
      tmpDir,
      timeoutMs,
      memoryMb,
      stdin = '',
      pidsLimit = 64,
      cpus = 1,
    } = options;

    const containerName = `executor-${randomUUID()}`;

    const args = [
      'run',
      '--rm',
      '-i',
      '--name',
      containerName,
      '--network',
      'none',
      '--read-only',
      '--security-opt',
      'no-new-privileges',
      '--cap-drop',
      'ALL',
      '--pids-limit',
      String(pidsLimit),
      '--cpus',
      String(cpus),
      '--memory',
      `${memoryMb}m`,
      '--memory-swap',
      `${memoryMb}m`,
      '-e',
      `MEMORY_MB=${memoryMb}`,
      '-v',
      `${tmpDir}:/code:rw`,
      '--tmpfs',
      '/tmp:rw,size=16m',
      image,
      ...command,
    ];

    return new Promise((resolve, reject) => {
      const child = spawn('docker', args);

      let stdout = '';
      let stderr = '';
      let stdoutTruncated = false;
      let stderrTruncated = false;
      let timedOut = false;
      let settled = false;

      const timer = setTimeout(() => {
        timedOut = true;
        const killer = spawn('docker', ['kill', containerName]);
        killer.on('error', () => {
        });
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        if (stdoutTruncated) return;
        stdout += chunk.toString('utf8');
        if (stdout.length > MAX_OUTPUT_BYTES) {
          stdout = stdout.slice(0, MAX_OUTPUT_BYTES);
          stdoutTruncated = true;
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        if (stderrTruncated) return;
        stderr += chunk.toString('utf8');
        if (stderr.length > MAX_OUTPUT_BYTES) {
          stderr = stderr.slice(0, MAX_OUTPUT_BYTES);
          stderrTruncated = true;
        }
      });

      child.on('error', err => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      });

      child.on('close', code => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? -1,
          timedOut,
          stdoutTruncated,
          stderrTruncated,
        });
      });

      child.stdin.on('error', () => {
      });

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();
    });
  }
}