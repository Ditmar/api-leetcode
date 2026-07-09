import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { DockerRunner } from '../docker.runner';
import type {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
} from '../executor.interface';

// Centralizamos la ruta de los assets de Docker para evitar rutas relativas frágiles
const DOCKER_ASSETS_DIR = path.join(process.cwd(), 'docker', 'executor-ts');

export class TypeScriptExecutor implements LanguageExecutor {
  readonly language = 'typescript' as const;

  constructor(private readonly dockerRunner: DockerRunner) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    // Creamos un directorio temporal aislado para la ejecución
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `ts-${input.submissionId}-`)
    );

    try {
      // Escribimos el código del usuario
      await fs.writeFile(path.join(tmpDir, 'solution.ts'), input.code);

      // Copiamos los assets necesarios desde la ruta centralizada
      await fs.copyFile(
        path.join(DOCKER_ASSETS_DIR, 'runner.ts'),
        path.join(tmpDir, 'runner.ts')
      );
      await fs.copyFile(
        path.join(DOCKER_ASSETS_DIR, 'entrypoint.sh'),
        path.join(tmpDir, 'entrypoint.sh')
      );

      const testCaseResults: TestCaseResult[] = [];
      let totalRuntimeMs = 0;

      for (const tc of input.testCases) {
        const start = Date.now();

        // Ejecución en contenedor Docker
        const { stdout, stderr, exitCode, timeoutTriggered } =
          await this.dockerRunner.run({
            image: 'executor-ts:latest',
            command: ['sh', '/code/entrypoint.sh'],
            tmpDir,
            timeoutMs: input.timeoutMs,
            memoryMb: input.memoryMb,
            stdin: tc.input,
          });

        const runtimeMs = Date.now() - start;
        totalRuntimeMs += runtimeMs;

        // Manejo de errores de compilación (Exit code 3 definido en entrypoint.sh)
        if (exitCode === 3) {
          return {
            testCaseResults: [],
            totalRuntimeMs: 0,
            peakMemoryMb: 0,
            compileError: stderr.trim() || 'Compilation failed',
          };
        }

        let status: TestCaseResult['status'] = 'success';
        let passed = false;

        // Mapeo de estados de ejecución
        if (timeoutTriggered) {
          status = 'time_limit_exceeded';
        } else if (exitCode !== 0) {
          status = 'runtime_error';
        } else {
          const actualOutput = stdout.trim();
          passed = actualOutput === tc.expectedOutput.trim();
          if (!passed) {
            status = 'wrong_answer';
          }
        }

        testCaseResults.push({
          testCaseId: tc.id,
          passed,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: stdout.trim(),
          runtimeMs,
          status,
        });
      }

      return {
        testCaseResults,
        totalRuntimeMs,
        peakMemoryMb: input.memoryMb,
      };
    } finally {
      // Garantizamos la limpieza del directorio temporal
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
