export interface ProgrammingExample {
  input: string;
  explanation: string | null;
}

export interface PublicProgrammingData {
  starterCode: unknown;
  examples: ProgrammingExample[];
}

export interface ProgrammingTestCase {
  input: string;
  expectedOutput: string;
  explanation: string | null;
  isExample: boolean;
}

export interface PrivateProgrammingData {
  testCases: ProgrammingTestCase[];
  expectedOutput: unknown;
}

export interface SplitProgrammingData {
  publicData: PublicProgrammingData;
  privateData: PrivateProgrammingData;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const splitProgrammingData = (raw: unknown): SplitProgrammingData => {
  const data = isRecord(raw) ? raw : {};
  const rawTestCases = Array.isArray(data.testCases) ? data.testCases : [];

  const testCases: ProgrammingTestCase[] = rawTestCases
    .filter(isRecord)
    .map(testCase => ({
      input: String(testCase.input ?? ''),
      expectedOutput: String(testCase.expectedOutput ?? ''),
      explanation:
        typeof testCase.explanation === 'string' ? testCase.explanation : null,
      isExample: testCase.isExample === true,
    }));

  return {
    publicData: {
      starterCode: data.starterCode ?? null,
      examples: testCases
        .filter(testCase => testCase.isExample)
        .map(testCase => ({
          input: testCase.input,
          explanation: testCase.explanation,
        })),
    },
    privateData: {
      testCases,
      expectedOutput: data.expectedOutput ?? null,
    },
  };
};
