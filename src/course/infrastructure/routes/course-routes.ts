import { Router } from 'express';
import { ExpressCourseController } from '../controller/express-course-controller';
import { AuthMiddleware } from '../../../auth/infrastructure/middleware/auth-middleware';

const router = Router();
const controller = new ExpressCourseController();

// Rutas públicas
router.get('/', (req, res) => controller.getCourses(req, res));
router.get('/:id', (req, res) => controller.getCourseById(req, res));

// Rutas protegidas
router.post('/:id/enroll', AuthMiddleware.validateToken, (req, res) =>
  controller.enrollInCourse(req, res)
);
router.get('/me/courses', AuthMiddleware.validateToken, (req, res) =>
  controller.getEnrolledCourses(req, res)
);

export { router as courseRoutes };
