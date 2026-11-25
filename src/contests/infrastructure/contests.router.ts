import { Router } from 'express';
import { ContestsController } from './controllers/contests.controller';
import { GetContestsUseCase } from '../application/use-cases/get-contests.use-case';
import { GetContestByIdUseCase } from '../application/use-cases/get-contest-by-id.use-case';
import { CreateContestUseCase } from '../application/use-cases/create-contest.use-case';
import { RegisterForContestUseCase } from '../application/use-cases/register-for-contest.use-case';
import { GetContestStatsUseCase } from '../application/use-cases/get-contest-stats.use-case';
import { PrismaContestRepository } from './persistence/prisma-contest.repository';
import { AuthMiddleware } from '../../auth/infrastructure/middleware/auth-middleware';
import { prisma } from '../../share/infrastructure/prisma-client';
const repository = new PrismaContestRepository(prisma);

const getContestsUseCase = new GetContestsUseCase(repository);
const getContestByIdUseCase = new GetContestByIdUseCase(repository);
const createContestUseCase = new CreateContestUseCase(repository);
const registerForContestUseCase = new RegisterForContestUseCase(
  repository,
  prisma
);
const getContestStatsUseCase = new GetContestStatsUseCase(repository);

const controller = new ContestsController(
  getContestsUseCase,
  getContestByIdUseCase,
  createContestUseCase,
  registerForContestUseCase,
  getContestStatsUseCase
);

const router = Router();

/**
 * @swagger
 * /api/contests/stats:
 *   get:
 *     summary: Estadísticas de concursos
 *     tags: [Contests]
 *     responses:
 *       200:
 *         description: Estadísticas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ContestStatsResponse' }
 */
router.get('/stats', (req, res) => controller.getContestStats(req, res));

/**
 * @swagger
 * /api/contests/{id}:
 *   get:
 *     summary: Obtener concurso por ID
 *     tags: [Contests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Concurso encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ContestResponse' }
 *       404:
 *         description: Concurso no encontrado
 */
router.get('/:id', (req, res) => controller.getContestById(req, res));

/**
 * @swagger
 * /api/contests:
 *   get:
 *     summary: Listar concursos
 *     tags: [Contests]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [UPCOMING, ACTIVE, FINISHED] }
 *     responses:
 *       200:
 *         description: Lista de concursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/ContestResponse' } }
 *                 pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */
router.get('/', (req, res) => controller.getContests(req, res));

/**
 * @swagger
 * /api/contests/{id}/register:
 *   post:
 *     summary: Registrarse en un concurso
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RegisterResponse' }
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Concurso no encontrado
 */
router.post('/:id/register', AuthMiddleware.validateToken, (req, res) =>
  controller.registerForContest(req, res)
);

/**
 * @swagger
 * /api/contests:
 *   post:
 *     summary: Crear un nuevo concurso
 *     tags: [Contests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateContestRequest' }
 *     responses:
 *       201:
 *         description: Concurso creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ContestResponse' }
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', AuthMiddleware.validateToken, (req, res) =>
  controller.createContest(req, res)
);

export { router as contestRoutes };
