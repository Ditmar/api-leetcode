import { CourseRepository } from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';

export class CourseCreate {
  constructor(private repository: CourseRepository) {}

  async execute(
    id: string,
    title: string,
    description: string,
    numberOfLessons: number,
    instructor?: string,
    duration?: string,
    level?: string
  ): Promise<Course> {
    const course = new Course(
      id,
      title,
      description,
      numberOfLessons,
      instructor,
      duration,
      level
    );
    return this.repository.create(course);
  }
}
