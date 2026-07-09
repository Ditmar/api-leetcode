import { Router } from 'express';
import { TestController } from '../controller/TestController';
import { authMiddleware } from '../../../share/infrastructure/middleware/auth.middleware';

const router = Router();
const controller = new TestController();

router.get('/', (req, res) => controller.getTests(req, res));
/**
 * @swagger
 * /api/tests:
 *   get:
 *     summary: Listar tests
 *     tags: [Tests]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [EASY, MEDIUM, HARD] }
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de tests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/TestResponse' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', (req, res) => controller.getTests(req, res));

/**
 * @swagger
 * /api/tests/{id}:
 *   get:
 *     summary: Obtener test por ID (con preguntas)
 *     tags: [Tests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Test encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TestDetailResponse' }
 *       404:
 *         description: Test no encontrado
 */
router.get('/:id', (req, res) => controller.getTestById(req, res));

/**
 * @swagger
 * /api/tests/{id}/start:
 *   post:
 *     summary: Iniciar un test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Test iniciado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StartTestResponse' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Test no encontrado
 */
router.post('/:id/start', authMiddleware, (req, res) =>
  controller.startTest(req, res)
);

/**
 * @swagger
 * /api/tests/{id}/questions:
 *   get:
 *     summary: Obtener preguntas de un test (requiere haber iniciado)
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de preguntas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions: { type: array, items: { type: object } }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Test no encontrado
 */
router.get('/:id/questions', authMiddleware, (req, res) =>
  controller.getQuestions(req, res)
);

/**
 * @swagger
 * /api/tests/{id}/submit:
 *   post:
 *     summary: Enviar respuestas de un test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubmitTestRequest' }
 *     responses:
 *       200:
 *         description: Resultado del test
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SubmitTestResponse' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Test no encontrado
 */
router.post('/:id/submit', authMiddleware, (req, res) =>
  controller.submitTest(req, res)
);

export { router as testRoutes };
