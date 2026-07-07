export interface CreateSubmissionDto {
  problemId: string;
  language: string;
  code: string;
  userId?: string;
}
