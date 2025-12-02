import { PrismaClient, Prisma } from '@prisma/client';
import {
  CourseRepository,
  GetCoursesParams,
  GetCoursesResult,
} from '../../domain/repository/course-repository';
import { Course } from '../../domain/course';

export class CoursePrismaRepository implements CourseRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(params: GetCoursesParams): Promise<GetCoursesResult> {
    const skip = (params.page - 1) * params.limit;
    const where: Prisma.CourseWhereInput = { isActive: true };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: 'desc' };
    if (params.orderBy) {
      switch (params.orderBy) {
        case 'title':
          orderBy = { title: 'asc' };
          break;
        case 'numberOfLessons':
          orderBy = { numberOfLessons: 'asc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: params.limit,
        orderBy,
      }),
      this.prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: data.map(
        c =>
          new Course(
            c.id,
            c.title,
            c.description,
            c.numberOfLessons,
            c.isActive,
            c.createdAt,
            c.updatedAt
          )
      ),
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    };
  }

  async getById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) return null;
    return new Course(
      course.id,
      course.title,
      course.description,
      course.numberOfLessons,
      course.isActive,
      course.createdAt,
      course.updatedAt
    );
  }

  async getAllByIds(ids: string[]): Promise<Course[]> {
    if (ids.length === 0) return [];
    const courses = await this.prisma.course.findMany({
      where: { id: { in: ids } },
    });
    return courses.map(
      c =>
        new Course(
          c.id,
          c.title,
          c.description,
          c.numberOfLessons,
          c.isActive,
          c.createdAt,
          c.updatedAt
        )
    );
  }

  async create(course: Course): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        id: course.id.getValue(),
        title: course.title.getValue(),
        description: course.description.getValue(),
        numberOfLessons: course.numberOfLessons.getValue(),
        isActive: course.isActive,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
    return new Course(
      created.id,
      created.title,
      created.description,
      created.numberOfLessons,
      created.isActive,
      created.createdAt,
      created.updatedAt
    );
  }
}
