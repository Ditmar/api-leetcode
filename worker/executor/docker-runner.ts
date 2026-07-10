import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export interface DockerRunOptions {
  image: string;
  command: string[];
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  pidsLimit?: number;
  cpus?: number;
}

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  outputTruncated: boolean;
}

const MAX_OUTPUT_BYTES = 1024 * 1024;

export class DockerRunner {
  async run(options: DockerRunOptions): Promise<DockerRunResult> {
    const {
      image,
      command,
      tmpDir,
      timeoutMs,
      memoryMb,
      pidsLimit = 64,
      cpus = 1,
    } = options;

    const containerName = `executor-${randomUUID()}`;

    const args = [
      'run',
      '--rm',
      '--name',
      containerName,
      '--network',
      'none',
      '--read-only',
      '--security-opt',
      'no-new-privileges',
      '--cap-drop',
      'ALL',
      '--user',
      `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
      '--pids-limit',
      String(pidsLimit),
      '--cpus',
      String(cpus),
      '--memory',
      `${memoryMb}m`,
      '--memory-swap',
      `${memoryMb}m`,
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
      let timedOut = false;
      let outputTruncated = false;
      let settled = false;

      const killContainer = () => {
        const killer = spawn('docker', ['kill', containerName]);
        killer.on('error', () => {
        });
        child.kill('SIGKILL');
      };

      const timer = setTimeout(() => {
        timedOut = true;
        killContainer();
      }, timeoutMs);

      const appendOutput = (stream: 'stdout' | 'stderr', chunk: Buffer) => {
        if (outputTruncated) return; 

        const current = stream === 'stdout' ? stdout : stderr;
        if (Buffer.byteLength(current, 'utf8') >= MAX_OUTPUT_BYTES) {
          outputTruncated = true;
          killContainer();
          return;
        }

        if (stream === 'stdout') {
          stdout += chunk.toString('utf8');
        } else {
          stderr += chunk.toString('utf8');
        }
      };

      child.stdout.on('data', (chunk: Buffer) => appendOutput('stdout', chunk));
      child.stderr.on('data', (chunk: Buffer) => appendOutput('stderr', chunk));

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
          outputTruncated,
        });
      });
    });
  }
}
