import { Request, Response, NextFunction } from 'express';
import { services } from '../../../share/infrastructure/services';
import { CourseFilters } from '../../domain/course-filters';
import { logger } from '@logger';

export class ExpressCourseController {
  // GET /api/courses
  async getAllCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters: CourseFilters = {
        level: req.query.level as string | undefined,
        instructor: req.query.instructor as string | undefined,
        title: req.query.title as string | undefined,
      };

      logger.info({ page, limit, filters }, 'Fetching courses');

      const result = await services.course.getAll.execute(page, limit, filters);

      res.status(200).json({
        data: result.courses.map(course => course.toJSON()),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      logger.error(err, 'Error fetching courses');
      next(err);
    }
  }

  // GET /api/courses/:id
  async getCourseById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const courseId = req.params.id;
      logger.info({ courseId }, 'Fetching course by ID');

      const course = await services.course.getById.execute(courseId);

      res.status(200).json(course.toJSON());
    } catch (err) {
      logger.error(err, 'Error fetching course by ID');
      next(err);
    }
  }

  // POST /api/courses
  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        title,
        description,
        numberOfLessons,
        instructor,
        duration,
        level,
      } = req.body;

      // Validación de campos requeridos
      if (!title || !description || !numberOfLessons) {
        res.status(400).json({
          error: 'Validation error',
          message:
            'Missing required fields: title, description, numberOfLessons',
        });
        return;
      }

      logger.info({ title }, 'Creating new course');

      const newCourse = await services.course.create.execute(
        '',
        title,
        description,
        numberOfLessons,
        instructor,
        duration,
        level
      );

      res.status(201).json(newCourse.toJSON());
    } catch (err) {
      logger.error(err, 'Error creating course');
      next(err);
    }
  }

  // POST /api/courses/:id/enroll
  async enrollInCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // userId viene del middleware de autenticación
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
        return;
      }

      const courseId = req.params.id;

      if (!courseId) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Course ID is required',
        });
        return;
      }

      logger.info({ userId, courseId }, 'Enrolling user in course');

      const enrollment = await services.course.enroll.execute(userId, courseId);

      res.status(201).json({
        message: 'Enrollment successful',
        enrollment: enrollment.toJSON(),
      });
    } catch (err) {
      logger.error(err, 'Error enrolling in course');
      next(err);
    }
  }

  // GET /api/users/me/courses
  async getMyCourses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // userId viene del middleware de autenticación
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated',
        });
        return;
      }

      logger.info({ userId }, 'Fetching user courses');

      const enrolledCourses = await services.course.getByUser.execute(userId);

      res.status(200).json({
        enrolledCourses: enrolledCourses.map(item => ({
          ...item.course.toJSON(),
          enrolledAt: item.enrolledAt,
        })),
      });
    } catch (err) {
      logger.error(err, 'Error fetching user courses');
      next(err);
    }
  }
}
