export interface RankingFilters {
  testId?: string;
  courseId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface RankingRow {
  userId: string;
  userName: string;
  avatar: string | null;
  totalPoints: number;
  submissions: number;
  correctAnswers: number;
  averageScore: number;
}

export interface RankingRepository {
  validateFilters(filters: RankingFilters): Promise<void>;
  getRankingRows(filters: RankingFilters): Promise<RankingRow[]>;
}
