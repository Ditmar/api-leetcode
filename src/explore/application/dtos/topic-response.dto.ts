export class TopicResponseDto {
  id: string | undefined;
  slug: string | undefined;
  title: string | undefined;
  description: string | undefined;
  category: string | undefined;
  difficulty: string | undefined;
  icon?: string | null;
  totalProblems: number | undefined;
  progress?: number;
}
