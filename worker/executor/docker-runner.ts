import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export interface DockerRunOptions {
  image: string;
  command: string[];
  /** Host directory bind-mounted at /code inside the container */
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  stdin?: string;
  /**
   * Max number of processes/threads allowed inside the container.
   * Kept low to prevent fork bombs. Callers can tighten it further
   * per-language (e.g. C++ uses 32).
   */
  pidsLimit?: number;
}

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

/**
 * Thin wrapper around the `docker` CLI that enforces the sandboxing
 * requirements shared by every language executor:
 *  - no network access
 *  - read-only root filesystem (except /code and /tmp)
 *  - no privilege escalation
 *  - all Linux capabilities dropped
 *  - pid limit to prevent fork bombs
 *  - hard memory limit
 *  - hard wall-clock timeout, container is killed if it's exceeded
 */
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

    // Named container so the timeout handler can kill the container
    // itself, not just the docker CLI client process. Killing only the
    // client would leave the container running in the daemon (leak).
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
        // Kill the container (SIGKILL inside the daemon). `--rm` then
        // removes it. Errors are ignored: the container may have just
        // exited on its own between the timeout and this call.
        const killer = spawn('docker', ['kill', containerName]);
        killer.on('error', () => {
          /* docker CLI missing — nothing else we can do here */
        });
        // Also terminate the client process so `close` fires promptly.
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

      // If the container exits before consuming all stdin (e.g. it
      // crashes immediately), writing would raise EPIPE — swallow it.
      child.stdin.on('error', () => {
        /* ignore EPIPE on early container exit */
      });

      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();
    });
  }
}
