import { JavaExecutor } from './java.executor';

const executor = new JavaExecutor();

const VALID_CODE = `
import java.util.Scanner;

public class Solution {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    long a = sc.nextLong();
    long b = sc.nextLong();
    System.out.println(a + b);
  }
}
`;

const SYNTAX_ERROR_CODE = `
public class Solution {
  public static void main(String[] args) {
    System.out.println("missing semicolon")
  }
}
`;

const RUNTIME_ERROR_CODE = `
public class Solution {
  public static void main(String[] args) {
    int[] arr = null;
    System.out.println(arr.length);
  }
}
`;

const INFINITE_LOOP_CODE = `
public class Solution {
  public static void main(String[] args) {
    while (true) {}
  }
}
`;

async function main(): Promise<void> {
  const ok = await executor.execute({
    submissionId: 'test-ok',
    code: VALID_CODE,
    language: 'java',
    testCases: [
      { id: 'tc1', input: '2 3\n', expectedOutput: '5' },
      { id: 'tc2', input: '10 -4\n', expectedOutput: '6' },
    ],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  console.log('[1] valid solution  ->', ok.status, '(expected: accepted)');

  const ce = await executor.execute({
    submissionId: 'test-ce',
    code: SYNTAX_ERROR_CODE,
    language: 'java',
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

  const rt = await executor.execute({
    submissionId: 'test-rt',
    code: RUNTIME_ERROR_CODE,
    language: 'java',
    testCases: [{ id: 'tc1', input: '', expectedOutput: '' }],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  console.log('[3] uncaught exc.   ->', rt.status, '(expected: runtime_error)');

  const tle = await executor.execute({
    submissionId: 'test-tle',
    code: INFINITE_LOOP_CODE,
    language: 'java',
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
