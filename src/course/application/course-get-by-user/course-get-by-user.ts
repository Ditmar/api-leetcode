import { EnrollmentRepository } from '../../domain/repository/enrollment-repository';
import { CourseRepository } from '../../domain/repository/course-repository';
import { UserId } from '../../../user/domain/user-id';
import { Course } from '../../domain/course';
import { CourseNotFoundError } from '../../domain/errors/course-not-found-error';

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

    if (enrollments.length === 0) {
      return [];
    }

    // Solución al problema N+1: obtener todos los cursos de una vez
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    const courses = await this.courseRepository.getByIds(courseIds);

    // Crear un mapa para búsqueda eficiente
    const courseMap = new Map(
      courses.map(course => [course.id.getValue(), course])
    );

    // Mapear enrollments con sus cursos correspondientes
    const coursesWithEnrollment = enrollments.map(enrollment => {
      const course = courseMap.get(enrollment.courseId.getValue());

      if (!course) {
        throw new CourseNotFoundError(
          `Course with id ${enrollment.courseId.getValue()} not found`
        );
      }

      return {
        course: course,
        enrolledAt: enrollment.enrolledAt,
      };
    });

    return coursesWithEnrollment;
  }
}
