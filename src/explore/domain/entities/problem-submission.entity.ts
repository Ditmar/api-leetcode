export class ProblemSubmission {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly userId: string,
    public language: string,
    public code: string,
    public mode: string,
    public status: string,
    public runtimeMs: number | null,
    public memoryMb: number | null,
    public score: number | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}
}
