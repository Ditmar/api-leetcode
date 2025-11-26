import { Course } from '../course';
import { CourseFilters } from '../course-filters';
import { CourseId } from '../course-id';
import { UpdateCourseDTO } from '../dtos/update-course.dto';

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
  getByIds(ids: CourseId[]): Promise<Course[]>;
  delete(id: CourseId): Promise<void>;
  edit(id: CourseId, data: UpdateCourseDTO): Promise<Course>;
}
