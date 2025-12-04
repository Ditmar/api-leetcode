import { CourseRepository } from '../../domain/repository/course-repository';
import { CourseNotFoundError } from '../../domain/errors';

export class CourseGetById {
  constructor(private repository: CourseRepository) {}

  async execute(id: string) {
    const course = await this.repository.getById(id);
    if (!course) {
      throw new CourseNotFoundError(id);
    }
    return course.toJSON();
  }
}
