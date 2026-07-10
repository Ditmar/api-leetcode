export interface DockerRunInput {
  image: string;
  command: string[];
  tmpDir: string;
  timeoutMs: number;
  memoryMb: number;
  stdin: string;
}

export interface DockerRunOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeoutTriggered?: boolean;
}

export class DockerRunner {
  async run(input: DockerRunInput): Promise<DockerRunOutput> {
    // Satisfy ESLint 'no-unused-vars' rule for this temporary mock
    void input;

    return { stdout: '', stderr: '', exitCode: 0, timeoutTriggered: false };
  }
}
