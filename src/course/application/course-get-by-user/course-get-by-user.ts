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

    return courses.map(course => {
      const enrollment = enrollments.find(
        e => e.courseId.getValue() === course.getIdValue() // ✅ getIdValue()
      );
      return {
        id: course.getIdValue(),
        title: course.getTitleValue(),
        description: course.getDescriptionValue(),
        numberOfLessons: course.getNumberOfLessonsValue(),
        enrolledAt: enrollment ? enrollment.enrolledAt.toISOString() : null,
      };
    });
  }
}
