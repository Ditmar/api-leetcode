import { CourseRepository } from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';
import { CourseId } from '../../domain/course-id';
import { CourseFilters } from '../../domain/course-filters';
import { CourseTitle } from '../../domain/course-title';
import { CourseDescription } from '../../domain/course-description';
import { CourseNumberOfLessons } from '../../domain/course-number-of-lessons';
import { UpdateCourseDTO } from '../../domain/dtos/update-course.dto';
import { v4 as uuidv4 } from 'uuid';

export class CourseMockRepository implements CourseRepository {
  private courses: Course[] = [];

  create(course: Course): Promise<Course> {
    if (!course.id.getValue() || course.id.getValue() === '') {
      const newId = uuidv4();
      const persistedCourse = new Course(
        newId,
        course.title.getValue(),
        course.description.getValue(),
        course.numberOfLessons.getValue(),
        course.instructor,
        course.duration,
        course.level,
        course.createdAt
      );
      this.courses.push(persistedCourse);
      return Promise.resolve(persistedCourse);
    }

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
    if (filters?.title) {
      filteredCourses = filteredCourses.filter(course =>
        course.title
          .getValue()
          .toLowerCase()
          .includes(filters.title!.toLowerCase())
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

  async getByIds(ids: CourseId[]): Promise<Course[]> {
    const idValues = ids.map(id => id.getValue());
    const foundCourses = this.courses.filter(course =>
      idValues.includes(course.id.getValue())
    );
    return Promise.resolve(foundCourses);
  }

  delete(id: CourseId): Promise<void> {
    this.courses = this.courses.filter(
      course => course.id.getValue() !== id.getValue()
    );
    return Promise.resolve();
  }

  edit(id: CourseId, data: UpdateCourseDTO): Promise<Course> {
    const course = this.courses.find(
      course => course.id.getValue() === id.getValue()
    );

    if (!course) {
      throw new Error('Course not found');
    }

    if (data.title !== undefined) {
      course.setTitle(new CourseTitle(data.title));
    }

    if (data.description !== undefined) {
      course.setDescription(new CourseDescription(data.description));
    }

    if (data.numberOfLessons !== undefined) {
      course.numberOfLessons = new CourseNumberOfLessons(data.numberOfLessons);
    }

    if (data.instructor !== undefined) {
      course.instructor = data.instructor;
    }

    if (data.duration !== undefined) {
      course.duration = data.duration;
    }

    if (data.level !== undefined) {
      course.level = data.level;
    }

    return Promise.resolve(course);
  }
}
