import { Enrollment } from '../enrollment';
import { EnrollmentId } from '../enrollment-id';
import { UserId } from '../../../user/domain/user-id';
import { CourseId } from '../course-id';

export interface EnrollmentRepository {
  create(enrollment: Enrollment): Promise<Enrollment>;
  findByUserAndCourse(
    userId: UserId,
    courseId: CourseId
  ): Promise<Enrollment | null>;
  findByUser(userId: UserId): Promise<Enrollment[]>;
  delete(id: EnrollmentId): Promise<void>;
}
