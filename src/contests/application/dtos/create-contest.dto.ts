export interface CreateContestDTO {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  startTime: string;
  endTime: string;
  durationMins: number;
  prize?: string;
}
