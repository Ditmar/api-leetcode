import { CourseRepository } from '../../domain/repository/course-repository';
import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { Enrollment } from '../../domain/enrollment';
import { CourseId } from '../../domain/course-id';
import { UserId } from '../../../user/domain/user-id';
import { CourseNotFoundError } from '../../domain/errors/course-not-found-error';
import { AlreadyEnrolledError } from '../../domain/errors/already-enrolled-error';

export class CourseEnroll {
  constructor(
    private courseRepository: CourseRepository,
    private enrollmentRepository: EnrollmentRepository
  ) {}

  async execute(userId: string, courseId: string): Promise<Enrollment> {
    const course = await this.courseRepository.getById(new CourseId(courseId));
    if (!course) {
      throw new CourseNotFoundError(`Course with id ${courseId} not found`);
    }

    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(
        new UserId(userId),
        new CourseId(courseId)
      );

    if (existingEnrollment) {
      throw new AlreadyEnrolledError('User is already enrolled in this course');
    }

    const enrollmentId = `${userId}-${courseId}-${Date.now()}`;
    const enrollment = new Enrollment(enrollmentId, userId, courseId);

    return this.enrollmentRepository.create(enrollment);
  }
}
