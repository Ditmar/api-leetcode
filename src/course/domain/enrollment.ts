import { EnrollmentId } from './enrollment-id';
import { CourseId } from './course-id';
import { AuthUserId } from '../../auth/domain/auth-user-id';

export class Enrollment {
  id: EnrollmentId;
  userId: AuthUserId;
  courseId: CourseId;
  enrolledAt: Date;

  constructor(id: string, userId: string, courseId: string, enrolledAt: Date) {
    this.id = new EnrollmentId(id);
    this.userId = new AuthUserId(userId);
    this.courseId = new CourseId(courseId);
    this.enrolledAt = enrolledAt;
  }
}
