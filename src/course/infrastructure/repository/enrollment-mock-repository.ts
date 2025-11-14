import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { Enrollment } from '../../domain/enrollment';
import { EnrollmentId } from '../../domain/enrollment-id';
import { UserId } from '../../../user/domain/user-id';
import { CourseId } from '../../domain/course-id';

export class EnrollmentMockRepository implements EnrollmentRepository {
  private enrollments: Enrollment[] = [];

  create(enrollment: Enrollment): Promise<Enrollment> {
    this.enrollments.push(enrollment);
    return Promise.resolve(enrollment);
  }

  findByUserAndCourse(
    userId: UserId,
    courseId: CourseId
  ): Promise<Enrollment | null> {
    const enrollment = this.enrollments.find(
      e =>
        e.userId.getValue() === userId.getValue() &&
        e.courseId.getValue() === courseId.getValue()
    );
    return Promise.resolve(enrollment || null);
  }

  findByUser(userId: UserId): Promise<Enrollment[]> {
    const userEnrollments = this.enrollments.filter(
      e => e.userId.getValue() === userId.getValue()
    );
    return Promise.resolve(userEnrollments);
  }

  delete(id: EnrollmentId): Promise<void> {
    this.enrollments = this.enrollments.filter(
      e => e.id.getValue() !== id.getValue()
    );
    return Promise.resolve();
  }
}
