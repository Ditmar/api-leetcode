import { Course } from '../course';
import { CourseFilters } from '../course-filters';
import { CourseId } from '../course-id';

export interface CourseRepository {
  create(course: Course): Promise<Course>;
  getAll(
    page?: number,
    limit?: number,
    filters?: CourseFilters
  ): Promise<{
    courses: Course[];
    total: number;
  }>;
  getById(id: CourseId): Promise<Course | null>;
  delete(id: CourseId): Promise<void>;
  edit(id: CourseId, course: Partial<Course>): Promise<Course>;
}
