export interface GetContestsDTO {
  status?: 'upcoming' | 'active' | 'past';
  skip?: number;
  take?: number;
}
