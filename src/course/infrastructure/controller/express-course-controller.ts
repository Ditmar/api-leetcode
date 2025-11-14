import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';
import { CourseNotFoundError } from '../../domain/errors/course-not-found-error';
import { AlreadyEnrolledError } from '../../domain/errors/already-enrolled-error';
import { CourseFilters } from '../../domain/course-filters';

export class ExpressCourseController {
  // GET /api/courses
  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters: CourseFilters = {
        level: req.query.level as string | undefined,
        instructor: req.query.instructor as string | undefined,
        title: req.query.title as string | undefined,
      };

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
      res.status(500).json({ error: 'Internal server error: ' + err });
    }
  }

  // GET /api/courses/:id
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const course = await services.course.getById.execute(req.params.id);
      res.status(200).json(course.toJSON());
    } catch (err) {
      if (err instanceof CourseNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Internal server error: ' + err });
      }
    }
  }

  // POST /api/courses
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const {
        id,
        title,
        description,
        numberOfLessons,
        instructor,
        duration,
        level,
      } = req.body;

      if (!id || !title || !description || !numberOfLessons) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const newCourse = await services.course.create.execute(
        id,
        title,
        description,
        numberOfLessons,
        instructor,
        duration,
        level
      );

      res.status(201).json(newCourse.toJSON());
    } catch (err) {
      res.status(400).json({ error: 'Bad request: ' + err });
    }
  }

  // POST /api/courses/:id/enroll
  async enrollInCourse(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const courseId = req.params.id;

      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }

      const enrollment = await services.course.enroll.execute(userId, courseId);

      res.status(201).json({
        message: 'Enrollment successful',
        enrollment: enrollment.toJSON(),
      });
    } catch (err) {
      if (err instanceof CourseNotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof AlreadyEnrolledError) {
        res.status(409).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Bad request: ' + err });
      }
    }
  }

  // GET /api/users/me/courses
  async getMyCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const enrolledCourses = await services.course.getByUser.execute(userId);

      res.status(200).json({
        enrolledCourses: enrolledCourses.map(item => ({
          ...item.course.toJSON(),
          enrolledAt: item.enrolledAt,
        })),
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error: ' + err });
    }
  }
}
