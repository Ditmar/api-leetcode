import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { CourseRepository } from '../../domain/repository/course-repository';

export class CourseGetByUser {
  constructor(
    private enrollmentRepo: EnrollmentRepository,
    private courseRepo: CourseRepository
  ) {}

  async execute(userId: string) {
    const enrollments = await this.enrollmentRepo.findByUserId(userId);
    const courseIds = enrollments.map(e => e.courseId.getValue());

    if (courseIds.length === 0) {
      return [];
    }

    const courses = await this.courseRepo.getAllByIds(courseIds);

    return courses.map(course => ({
      id: course.id.getValue(),
      title: course.title.getValue(),
      description: course.description.getValue(),
      numberOfLessons: course.numberOfLessons.getValue(),
      enrolledAt: enrollments
        .find(e => e.courseId.getValue() === course.id.getValue())
        ?.enrolledAt.toISOString(),
    }));
  }
}
