import { Router } from 'express';
import { getPrismaClient } from '../../share/infrastructure/prisma';
import { AuthMiddleware } from '../../auth/infrastructure/middleware/auth-middleware';
import { PrismaProblemRepository } from './persistence/prisma-problem.repository';
import { ProblemsController } from './controllers/problems.controller';
import { GetProblemsUseCase } from '../application/use-cases/get-problems.use-case';
import { GetProblemByIdUseCase } from '../application/use-cases/get-problem-by-id.use-case';
import { GetProblemBySlugUseCase } from '../application/use-cases/get-problem-by-slug.use-case';
import { GetTagsUseCase } from '../application/use-cases/get-tags.use-case';
import { GetStatsUseCase } from '../application/use-cases/get-stats.use-case';
import { CreateProblemUseCase } from '../application/use-cases/create-problem.use-case';
import { UpdateProblemUseCase } from '../application/use-cases/update-problem.use-case';

const repository = new PrismaProblemRepository(getPrismaClient());

const controller = new ProblemsController(
  new GetProblemsUseCase(repository),
  new GetProblemByIdUseCase(repository),
  new GetProblemBySlugUseCase(repository),
  new GetTagsUseCase(repository),
  new GetStatsUseCase(repository),
  new CreateProblemUseCase(repository),
  new UpdateProblemUseCase(repository),
  repository
);

const problemsRouter = Router();

/**
 * @swagger
 * /api/problems:
 *   get:
 *     summary: Listar problemas
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [EASY, MEDIUM, HARD] }
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Etiquetas separadas por coma
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de problemas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/ProblemResponse' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
problemsRouter.get('/', (req, res) => controller.list(req, res));

/**
 * @swagger
 * /api/problems/tags:
 *   get:
 *     summary: Obtener todas las etiquetas
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: Lista de etiquetas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags: { type: array, items: { type: string } }
 */
problemsRouter.get('/tags', (req, res) => controller.tags(req, res));

/**
 * @swagger
 * /api/problems/stats:
 *   get:
 *     summary: Estadísticas de problemas (requiere autenticación)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 byDifficulty: { type: object }
 *       401:
 *         description: No autorizado
 */
problemsRouter.get('/stats', AuthMiddleware.validateToken, (req, res) =>
  controller.stats(req, res)
);

/**
 * @swagger
 * /api/problems/{id}:
 *   get:
 *     summary: Obtener problema por ID
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Problema encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProblemResponse' }
 *       404:
 *         description: Problema no encontrado
 */
problemsRouter.get('/:id', (req, res) => controller.getById(req, res));

/**
 * @swagger
 * /api/problems/slug/{slug}:
 *   get:
 *     summary: Obtener problema por slug
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Problema encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProblemResponse' }
 *       404:
 *         description: Problema no encontrado
 */
problemsRouter.get('/slug/:slug', (req, res) => controller.getBySlug(req, res));

/**
 * @swagger
 * /api/problems:
 *   post:
 *     summary: Crear un nuevo problema
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProblemRequest' }
 *     responses:
 *       201:
 *         description: Problema creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProblemResponse' }
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
problemsRouter.post('/', AuthMiddleware.validateToken, (req, res) =>
  controller.create(req, res)
);

/**
 * @swagger
 * /api/problems/{id}:
 *   patch:
 *     summary: Actualizar problema
 *     tags: [Problems]
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
 *           schema: { $ref: '#/components/schemas/UpdateProblemRequest' }
 *     responses:
 *       200:
 *         description: Problema actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProblemResponse' }
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Problema no encontrado
 */
problemsRouter.patch('/:id', AuthMiddleware.validateToken, (req, res) =>
  controller.update(req, res)
);

/**
 * @swagger
 * /api/problems/{id}:
 *   delete:
 *     summary: Eliminar problema (soft delete)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Problema eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Problema no encontrado
 */
problemsRouter.delete('/:id', AuthMiddleware.validateToken, (req, res) =>
  controller.remove(req, res)
);

export { problemsRouter };
