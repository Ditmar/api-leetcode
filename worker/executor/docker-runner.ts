import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export interface DockerRunOptions {
  image: string;
  command: string[];
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  stdin?: string;
  pidsLimit?: number;
}

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
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
      let settled = false;

      const timer = setTimeout(() => {
        timedOut = true;
        const killer = spawn('docker', ['kill', containerName]);
        killer.on('error', () => {
        });
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString('utf8');
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString('utf8');
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
