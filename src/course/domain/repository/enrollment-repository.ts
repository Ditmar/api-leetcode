import { Enrollment } from '../enrollment';

export interface EnrollmentRepository {
  create(userId: string, courseId: string): Promise<Enrollment>;
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null>;
  findByUserId(userId: string): Promise<Enrollment[]>;
}
