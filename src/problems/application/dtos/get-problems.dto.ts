export interface GetProblemsDto {
  search?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface GetProblemsMetaDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
