import { CourseRepository } from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';
import { CourseFilters } from 'course/domain/course-filters';

export class CourseGetAll {
  constructor(private repository: CourseRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: CourseFilters
  ): Promise<{
    courses: Course[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.repository.getAll(page, limit, filters);
    return {
      courses: result.courses,
      total: result.total,
      page,
      limit,
    };
  }
}
