import { spawn } from 'child_process';

export interface DockerRunInput {
  image: string;
  command: string[];
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  stdin: string;
  networkDisabled: boolean;
  readOnly: boolean;
  pidsLimit: number;
  user: string;
  dropPrivileges: boolean;
  cpus: number;
}

export interface DockerRunOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeoutTriggered?: boolean;
}

/**
 * Infrastructure Mock for Docker execution.
 * NOTE: This is a temporary stub. Security constraints (timeout, network, memory)
 * will be implemented in ticket API-EXE-001.
 */
export class DockerRunner {
  async run(input: DockerRunInput): Promise<DockerRunOutput> {
    const {
      image,
      command,
      tmpDir,
      timeoutMs,
      memoryMb,
      stdin,
      networkDisabled,
      readOnly,
      pidsLimit,
      user,
      dropPrivileges,
      cpus,
    } = input;

    const dockerArgs = ['run', '--rm', '-i'];

    // Apply rigorous security controls
    if (networkDisabled) dockerArgs.push('--network', 'none');
    if (readOnly) dockerArgs.push('--read-only');
    if (dropPrivileges) dockerArgs.push('--security-opt=no-new-privileges');
    if (pidsLimit > 0) dockerArgs.push('--pids-limit', pidsLimit.toString());
    if (user) dockerArgs.push('--user', user);
    if (memoryMb > 0) dockerArgs.push('--memory', `${memoryMb}m`);
    if (cpus > 0) dockerArgs.push('--cpus', cpus.toString());

    dockerArgs.push('-v', `${tmpDir}:/workspace`, '-w', '/workspace');
    dockerArgs.push(image, ...command);

    return new Promise((resolve, reject) => {
      const child = spawn('docker', dockerArgs);

      let stdout = '';
      let stderr = '';
      let timeoutTriggered = false;

      const timer = setTimeout(() => {
        timeoutTriggered = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', data => { stdout += data.toString(); });
      child.stderr.on('data', data => { stderr += data.toString(); });

      if (stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }

      child.on('error', err => {
        clearTimeout(timer);
        reject(err);
      });

      child.on('close', code => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 128,
          timeoutTriggered,
        });
      });
    });
  }
}