export class LeaderboardEntry {
  constructor(
    public readonly rank: number,
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly solvedProblems: number,
    public readonly correctSubmissions: number
  ) {}
}
