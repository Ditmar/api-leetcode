import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { Enrollment } from '../../domain/enrollment';
import { EnrollmentId } from '../../domain/enrollment-id';
import { UserId } from '../../../user/domain/user-id';
import { CourseId } from '../../domain/course-id';
import { v4 as uuidv4 } from 'uuid';

export class EnrollmentMockRepository implements EnrollmentRepository {
  private enrollments: Enrollment[] = [];

  create(enrollment: Enrollment): Promise<Enrollment> {
    // Generar UUID para el enrollment si no tiene ID
    const id = uuidv4();
    const persistedEnrollment = Enrollment.fromPersistence(
      id,
      enrollment.userId.getValue(),
      enrollment.courseId.getValue(),
      enrollment.enrolledAt
    );

    this.enrollments.push(persistedEnrollment);
    return Promise.resolve(persistedEnrollment);
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
