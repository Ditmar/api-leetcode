import { EnrollmentId } from './enrollment-id';
import { UserId } from '../../user/domain/user-id';
import { CourseId } from './course-id';

export class Enrollment {
  id: EnrollmentId;
  userId: UserId;
  courseId: CourseId;
  enrolledAt: Date;

  private constructor(
    id: string,
    userId: string,
    courseId: string,
    enrolledAt?: Date
  ) {
    this.id = new EnrollmentId(id);
    this.userId = new UserId(userId);
    this.courseId = new CourseId(courseId);
    this.enrolledAt = enrolledAt || new Date();
  }

  static create(userId: string, courseId: string): Enrollment {
    return new Enrollment('', userId, courseId);
  }

  static fromPersistence(
    id: string,
    userId: string,
    courseId: string,
    enrolledAt: Date
  ): Enrollment {
    return new Enrollment(id, userId, courseId, enrolledAt);
  }

  public toJSON() {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      courseId: this.courseId.getValue(),
      enrolledAt: this.enrolledAt,
    };
  }

  public print(): void {
    console.log(
      `Enrollment [ID: ${this.id.getValue()},
      User ID: ${this.userId.getValue()}, 
      Course ID: ${this.courseId.getValue()}, 
      Enrolled At: ${this.enrolledAt.toISOString()}]`
    );
  }

  public getEnrollmentInfo(): string {
    return `User ID: ${this.userId.getValue()}, 
    Course ID: ${this.courseId.getValue()}`;
  }
}
