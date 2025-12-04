import { Request, Response } from 'express';
import { AlreadyEnrolledError, CourseNotFoundError } from '../../domain/errors';
import logger from '@logger';
import { services } from '../../../share/infrastructure/services';

export class ExpressCourseController {
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, isActive, orderBy } = req.query;

      // Validaciones...
      if (
        isActive !== undefined &&
        isActive !== 'true' &&
        isActive !== 'false'
      ) {
        res.status(400).json({
          success: false,
          error: 'isActive must be "true" or "false"',
        });
        return;
      }

      const parsedParams = {
        page: Number(page),
        limit: Number(limit),
        search: search as string | undefined,
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        orderBy: orderBy as
          | 'title'
          | 'createdAt'
          | 'numberOfLessons'
          | undefined,
      };

      const result = await services.course.getAll.execute(parsedParams);
      res.status(200).json({ success: true, ...result });
    } catch (_error: unknown) {
      logger.error({ error: _error }, 'Error in getCourses');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Course ID is required' });
        return;
      }
      if (!this.isValidUUID(id)) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid course ID format' });
        return;
      }

      const course = await services.course.getById.execute(id);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      logger.error('Error in getCourseById');
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async enrollInCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId; // viene del AuthMiddleware

      if (!id) {
        res
          .status(400)
          .json({ success: false, error: 'Course ID is required' });
        return;
      }
      if (!this.isValidUUID(id)) {
        res
          .status(400)
          .json({ success: false, error: 'Invalid course ID format' });
        return;
      }
      if (!userId) {
        res
          .status(401)
          .json({ success: false, error: 'Authentication required' });
        return;
      }

      const result = await services.course.enroll.execute(userId, id);
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { enrollmentId: result.enrollmentId },
      });
    } catch (error) {
      if (error instanceof AlreadyEnrolledError) {
        res.status(409).json({
          success: false,
          error: error instanceof Error ? error.message : 'Already enrolled',
        });
        return;
      }
      if (error instanceof CourseNotFoundError) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      logger.error('Error in enrollInCourse');
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getEnrolledCourses(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res
          .status(401)
          .json({ success: false, error: 'Authentication required' });
        return;
      }

      const courses = await services.course.getByUser.execute(userId);
      res.status(200).json({ success: true, data: courses });
    } catch (_error) {
      logger.error({ error: _error }, 'Error in getEnrolledCourses');
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
