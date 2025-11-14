import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { CourseRepository } from '../../domain/repository/course-repository';
import { UserId } from '../../../user/domain/user-id';
import { Course } from '../../domain/course';

interface CourseWithEnrollment {
  course: Course;
  enrolledAt: Date;
}

export class CourseGetByUser {
  constructor(
    private enrollmentRepository: EnrollmentRepository,
    private courseRepository: CourseRepository
  ) {}

  async execute(userId: string): Promise<CourseWithEnrollment[]> {
    const enrollments = await this.enrollmentRepository.findByUser(
      new UserId(userId)
    );

    const coursesWithEnrollment = await Promise.all(
      enrollments.map(async enrollment => {
        const course = await this.courseRepository.getById(enrollment.courseId);

        if (!course) {
          throw new Error(
            `Course with id ${enrollment.courseId.getValue()} not found`
          );
        }

        return {
          course: course,
          enrolledAt: enrollment.enrolledAt,
        };
      })
    );

    return coursesWithEnrollment;
  }
}
