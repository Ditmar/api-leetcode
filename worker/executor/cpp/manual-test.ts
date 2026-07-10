/**
 * Manual verification script for the acceptance criteria of API-EXE-004.
 *
 * Prerequisites:
 *   docker build -f docker/executor-cpp/Dockerfile -t executor-cpp:latest .
 *
 * Run with:
 *   npx ts-node worker/executor/cpp/manual-test.ts
 */
import { CppExecutor } from './cpp.executor';

const executor = new CppExecutor();

const VALID_CODE = `
#include <iostream>
int main() {
  long long a, b;
  std::cin >> a >> b;
  std::cout << a + b << std::endl;
  return 0;
}
`;

const SYNTAX_ERROR_CODE = `
#include <iostream>
int main() {
  std::cout << "missing semicolon"
}
`;

const SEGFAULT_CODE = `
int main() {
  int* p = nullptr;
  return *p;
}
`;

const INFINITE_LOOP_CODE = `
int main() {
  while (true) {}
  return 0;
}
`;

async function main(): Promise<void> {
  // 1. Valid C++17 solution compiles and runs
  const ok = await executor.execute({
    submissionId: 'test-ok',
    code: VALID_CODE,
    language: 'cpp',
    testCases: [
      { id: 'tc1', input: '2 3\n', expectedOutput: '5' },
      { id: 'tc2', input: '10 -4\n', expectedOutput: '6' },
    ],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  console.log('[1] valid solution  ->', ok.status, '(expected: accepted)');

  // 2. Syntax error -> compileError field, not a crash
  const ce = await executor.execute({
    submissionId: 'test-ce',
    code: SYNTAX_ERROR_CODE,
    language: 'cpp',
    testCases: [{ id: 'tc1', input: '', expectedOutput: '' }],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  console.log(
    '[2] syntax error    ->',
    ce.status,
    '(expected: compile_error), compileError present:',
    Boolean(ce.compileError)
  );

  // 3. Segfault -> runtime_error
  const rt = await executor.execute({
    submissionId: 'test-rt',
    code: SEGFAULT_CODE,
    language: 'cpp',
    testCases: [{ id: 'tc1', input: '', expectedOutput: '' }],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  console.log('[3] segfault        ->', rt.status, '(expected: runtime_error)');

  // 4. Infinite loop -> time_limit_exceeded and container killed
  const tle = await executor.execute({
    submissionId: 'test-tle',
    code: INFINITE_LOOP_CODE,
    language: 'cpp',
    testCases: [{ id: 'tc1', input: '', expectedOutput: '' }],
    timeoutMs: 2000,
    memoryMb: 128,
  });
  console.log(
    '[4] infinite loop   ->',
    tle.status,
    '(expected: time_limit_exceeded)'
  );
  console.log(
    '    verify no leaked containers with: docker ps --filter name=executor-'
  );
}

main().catch(err => {
  console.error('Manual test failed:', err);
  process.exit(1);
});
