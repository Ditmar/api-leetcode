import { Router } from 'express';
import { ExpressCourseController } from '../controller/express-course-controller';

const courseController = new ExpressCourseController();

const courseRoutes = Router();

courseRoutes.get('/', (req, res) => courseController.getAllCourses(req, res));

courseRoutes.get('/:id', (req, res) =>
  courseController.getCourseById(req, res)
);

courseRoutes.post('/', (req, res) => courseController.createCourse(req, res));

courseRoutes.post('/:id/enroll', (req, res) =>
  courseController.enrollInCourse(req, res)
);

export { courseRoutes };
