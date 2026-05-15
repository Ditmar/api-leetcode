export class TopicResponseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  icon?: string | null;
  totalProblems: number;
  progress?: number;
}
