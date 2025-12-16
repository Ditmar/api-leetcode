import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { AlreadyEnrolledError } from '../../domain/errors';

export class CourseEnroll {
  constructor(private enrollmentRepo: EnrollmentRepository) {}

  async execute(
    userId: string,
    courseId: string
  ): Promise<{ enrollmentId: string }> {
    const existing = await this.enrollmentRepo.findByUserAndCourse(
      userId,
      courseId
    );
    if (existing) {
      throw new AlreadyEnrolledError(userId, courseId);
    }

    const enrollment = await this.enrollmentRepo.create(userId, courseId);
    return { enrollmentId: enrollment.id.getValue() };
  }
}
