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

  updateResult(
    status: string,
    runtimeMs: number | null,
    memoryMb: number | null,
    score: number | null
  ): void {
    this.status = status;
    this.runtimeMs = runtimeMs;
    this.memoryMb = memoryMb;
    this.score = score;
    this.updatedAt = new Date();
  }
}
