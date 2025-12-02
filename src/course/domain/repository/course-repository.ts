import { Course } from '../course';

export interface GetCoursesParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  orderBy?: 'title' | 'createdAt' | 'numberOfLessons';
}

export interface GetCoursesResult {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseRepository {
  getAll(params: GetCoursesParams): Promise<GetCoursesResult>;
  getById(id: string): Promise<Course | null>;
  getAllByIds(ids: string[]): Promise<Course[]>;
  create(course: Course): Promise<Course>;
}
