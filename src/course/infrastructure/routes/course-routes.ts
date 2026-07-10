import { Router } from 'express';
import { ExpressCourseController } from '../controller/express-course-controller';
import { AuthMiddleware } from '../../../auth/infrastructure/middleware/auth-middleware';

const router = Router();
const controller = new ExpressCourseController();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Listar cursos
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/CourseResponse' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', (req, res) => controller.getCourses(req, res));

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obtener curso por ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CourseResponse' }
 *       404:
 *         description: Curso no encontrado
 */
router.get('/:id', (req, res) => controller.getCourseById(req, res));

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Inscribirse en un curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Inscripción exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EnrollRequest' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 */
router.post('/:id/enroll', AuthMiddleware.validateToken, (req, res) =>
  controller.enrollInCourse(req, res)
);

/**
 * @swagger
 * /api/courses/me/courses:
 *   get:
 *     summary: Obtener cursos en los que estoy inscrito
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos inscritos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EnrolledCoursesResponse' }
 *       401:
 *         description: No autorizado
 */
router.get('/me/courses', AuthMiddleware.validateToken, (req, res) =>
  controller.getEnrolledCourses(req, res)
);

export { router as courseRoutes };
