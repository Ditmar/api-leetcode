import {
  CourseRepository,
  GetCoursesParams,
} from '../../domain/repository/course-repository';

export class CourseGetAll {
  constructor(private repository: CourseRepository) {}

  async execute(params: GetCoursesParams) {
    // Validación de parámetros
    if (params.page < 1) params.page = 1;
    if (params.limit < 1) params.limit = 10;
    if (params.limit > 100) params.limit = 100;

    const result = await this.repository.getAll(params);

    return {
      data: result.data.map(course => ({
        id: course.id.getValue(),
        title: course.title.getValue(),
        description: course.description.getValue(),
        numberOfLessons: course.numberOfLessons.getValue(),
        isActive: course.isActive,
        createdAt: course.createdAt.toISOString(),
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
