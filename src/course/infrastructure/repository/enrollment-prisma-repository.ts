import { PrismaClient } from '@prisma/client';
import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { Enrollment } from '../../domain/enrollment';
import { v4 as uuidv4 } from 'uuid';

export class EnrollmentPrismaRepository implements EnrollmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, courseId: string): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.create({
      data: {
        id: uuidv4(),
        userId,
        courseId,
      },
    });
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt
    );
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    if (!enrollment) return null;
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt
    );
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
    });
    return enrollments.map(
      e => new Enrollment(e.id, e.userId, e.courseId, e.enrolledAt)
    );
  }
}
