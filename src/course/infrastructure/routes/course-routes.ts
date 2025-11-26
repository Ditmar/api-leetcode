import { Router } from 'express';
import { ExpressCourseController } from '../controller/express-course-controller';
import { authMiddleware } from '../../../share/infrastructure/middleware/auth.middleware';

const courseController = new ExpressCourseController();

const courseRoutes = Router();

courseRoutes.get('/', (req, res, next) =>
  courseController.getAllCourses(req, res, next)
);

courseRoutes.get('/me', authMiddleware, (req, res, next) =>
  courseController.getMyCourses(req, res, next)
);

courseRoutes.get('/:id', (req, res, next) =>
  courseController.getCourseById(req, res, next)
);

courseRoutes.post('/', (req, res, next) =>
  courseController.createCourse(req, res, next)
);

courseRoutes.post('/:id/enroll', authMiddleware, (req, res, next) =>
  courseController.enrollInCourse(req, res, next)
);

export { courseRoutes };
