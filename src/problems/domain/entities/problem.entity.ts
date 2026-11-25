export class TestCase {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly input: string,
    public readonly expectedOutput: string,
    public readonly explanation: string | null,
    public readonly isExample: boolean,
    public readonly order: number
  ) {}
}

export class StarterCode {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly language: string,
    public readonly code: string
  ) {}
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly description: string,
    public readonly difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    public readonly tags: string[],
    public readonly constraints: string[],
    public readonly isActive: boolean,
    public readonly acceptedCount: number,
    public readonly submissionCount: number,
    public readonly testCases: TestCase[],
    public readonly starterCodes: StarterCode[]
  ) {}

  get acceptanceRate(): number {
    if (this.submissionCount === 0) return 0;
    return (this.acceptedCount / this.submissionCount) * 100;
  }
}
