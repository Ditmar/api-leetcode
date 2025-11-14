import { CourseRepository } from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';
import { CourseId } from '../../domain/course-id';
import { CourseNotFoundError } from '../../domain/errors/course-not-found-error';

export class CourseGetById {
  constructor(private repository: CourseRepository) {}

  async execute(id: string | undefined): Promise<Course> {
    if (!id) {
      throw new CourseNotFoundError('Course ID is required');
    }

    const courseId = new CourseId(id);
    const course = await this.repository.getById(courseId);

    if (!course) {
      throw new CourseNotFoundError(`Course with id ${id} not found`);
    }

    return course;
  }
}
