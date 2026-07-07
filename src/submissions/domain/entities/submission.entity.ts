export class Submission {
  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly userId: string,
    public readonly language: string,
    public readonly code: string,
    public readonly status: string,
    public readonly runtime: number | null,
    public readonly memory: number | null,
    public readonly createdAt: Date
  ) {}
}
