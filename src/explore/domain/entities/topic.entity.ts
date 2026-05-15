export class TopicEntity {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly description: string,
    public readonly category: string,
    public readonly difficulty: string,
    public readonly icon: string | null,
    public readonly totalProblems: number,
    public readonly progress?: number
  ) {}
}
