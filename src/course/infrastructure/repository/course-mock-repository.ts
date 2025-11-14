import { CourseRepository } from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';
import { CourseId } from '../../domain/course-id';
import { CourseFilters } from 'course/domain/course-filters';

export class CourseMockRepository implements CourseRepository {
  private courses: Course[] = [];

  create(course: Course): Promise<Course> {
    this.courses.push(course);
    return Promise.resolve(course);
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    filters?: CourseFilters
  ): Promise<{ courses: Course[]; total: number }> {
    let filteredCourses = [...this.courses];

    if (filters?.level) {
      filteredCourses = filteredCourses.filter(
        course => course.level === filters.level
      );
    }
    if (filters?.instructor) {
      filteredCourses = filteredCourses.filter(
        course => course.instructor === filters.instructor
      );
    }

    const total = filteredCourses.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    return Promise.resolve({
      courses: paginatedCourses,
      total,
    });
  }

  getById(id: CourseId): Promise<Course | null> {
    const course = this.courses.find(
      course => course.id.getValue() === id.getValue()
    );
    return Promise.resolve(course || null);
  }

  delete(id: CourseId): Promise<void> {
    this.courses = this.courses.filter(
      course => course.id.getValue() !== id.getValue()
    );
    return Promise.resolve();
  }

  edit(id: CourseId, courseData: Partial<Course>): Promise<Course> {
    const course = this.courses.find(
      course => course.id.getValue() === id.getValue()
    );

    if (!course) {
      throw new Error('Course not found');
    }

    if (courseData.title !== undefined) {
      course.setTitle(courseData.title);
    }

    if (courseData.description !== undefined) {
      course.setDescription(courseData.description);
    }

    if (courseData.instructor !== undefined) {
      course.instructor = courseData.instructor;
    }

    if (courseData.duration !== undefined) {
      course.duration = courseData.duration;
    }

    if (courseData.level !== undefined) {
      course.level = courseData.level;
    }

    return Promise.resolve(course);
  }
}
