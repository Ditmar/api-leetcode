import {
  CourseRepository,
  GetCoursesParams,
} from '../../domain/repository/course-repository';

export class CourseGetAll {
  constructor(private repository: CourseRepository) {}

  async execute(params: GetCoursesParams) {
    // Validación de parámetros
    const safeParams = {
      page: params.page > 0 ? params.page : 1,
      limit: params.limit > 0 ? (params.limit > 100 ? 100 : params.limit) : 10,
      search: params.search,
      isActive: params.isActive,
      orderBy: params.orderBy,
    };

    const result = await this.repository.getAll(safeParams);

    return {
      data: result.data.map(course => ({
        id: course.getIdValue(),
        title: course.getTitleValue(),
        description: course.getDescriptionValue(),
        numberOfLessons: course.getNumberOfLessonsValue(),
        isActive: course.getIsActive(),
        createdAt: course.getCreatedAt().toISOString(),
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
