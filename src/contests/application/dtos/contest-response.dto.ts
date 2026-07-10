export interface ContestProblemResponseDTO {
  id: string;
  problemId: string;
  order: number;
  points: number;
  problem?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  };
}

export interface ContestResponseDTO {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  prize: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  problems?: ContestProblemResponseDTO[];
}
