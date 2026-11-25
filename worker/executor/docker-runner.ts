import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export interface DockerRunOptions {
  image: string;
  command: string[];
  /** Host directory bind-mounted at /code inside the container */
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  /**
   * Max number of processes/threads allowed inside the container.
   * Kept low to prevent fork bombs. Callers can tighten it further
   * per-language (e.g. C++ uses 32).
   */
  pidsLimit?: number;
  /**
   * Max number of CPUs the container may use (Docker's --cpus, accepts
   * fractional values e.g. 0.5). Without this, a CPU-bound program that
   * never triggers the wall-clock timeout can hog host cores and starve
   * other concurrent submissions.
   */
  cpus?: number;
}

export interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  /**
   * True when stdout or stderr hit MAX_OUTPUT_BYTES and the container
   * was killed early. exitCode in this case is not meaningful (-1).
   */
  outputTruncated: boolean;
}

/**
 * Hard cap on how much stdout/stderr we buffer in the host process per
 * run. Without this, `while(true) printf(...)` in the user's program
 * grows this string unbounded in Node's memory on the HOST — the
 * container's --memory flag does not protect against this, since the
 * buffer lives outside the container.
 */
const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MB per stream

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
 *
 * Program input (stdin) is NOT piped live through `docker run`. Docker
 * Desktop's Windows/WSL2 backend has intermittent hangs attaching
 * interactive stdin (`-i`) when the writer is a spawned process rather
 * than a real terminal (see PR #35 discussion). Instead, callers write
 * the test-case input to a file inside `tmpDir` and have their run
 * script redirect it (`< /code/input.txt`), which is deterministic on
 * every platform and needs no stdin attach at all.
 */
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

    // Named container so the timeout handler can kill the container
    // itself, not just the docker CLI client process. Killing only the
    // client would leave the container running in the daemon (leak).
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
      // Run as the same uid:gid that owns tmpDir on the host instead of
      // the image's baked-in non-root user. This lets us keep tmpDir at
      // its default 0700 (owner-only) instead of opening it to every
      // user on the host system just so the container can read/write it.
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

      // Shared by the timeout path and the output-limit path: both need
      // to kill the container the same way (daemon-side kill, then the
      // local docker CLI client so `close` fires promptly).
      const killContainer = () => {
        const killer = spawn('docker', ['kill', containerName]);
        killer.on('error', () => {
          /* docker CLI missing — nothing else we can do here */
        });
        child.kill('SIGKILL');
      };

      const timer = setTimeout(() => {
        timedOut = true;
        killContainer();
      }, timeoutMs);

      const appendOutput = (stream: 'stdout' | 'stderr', chunk: Buffer) => {
        if (outputTruncated) return; // already cut, ignore further data

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
