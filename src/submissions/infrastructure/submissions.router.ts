import { Router } from 'express';
import { AuthMiddleware } from '../../auth/infrastructure/middleware/auth-middleware';
import { getPrismaClient } from '../../share/infrastructure/prisma';
import { PrismaSubmissionRepository } from './persistence/prisma-submission.repository';
import { DefaultExecutionWorker } from './services/default-execution-worker';
import { CreateSubmissionUseCase } from '../application/use-cases/create-submission.use-case';
import { GetSubmissionByIdUseCase } from '../application/use-cases/get-submission-by-id.use-case';
import { GetSubmissionsByUserUseCase } from '../application/use-cases/get-submissions-by-user.use-case';
import { SubmissionsController } from './controllers/submissions.controller';
import { asyncHandler } from '../../share/infrastructure/middleware/async-handler';

const repository = new PrismaSubmissionRepository(getPrismaClient());
const worker = new DefaultExecutionWorker();
const controller = new SubmissionsController(
  new CreateSubmissionUseCase(repository, worker),
  new GetSubmissionByIdUseCase(repository),
  new GetSubmissionsByUserUseCase(repository)
);

const submissionsRouter = Router();

submissionsRouter.post(
  '/submissions',
  AuthMiddleware.validateToken,
  asyncHandler((req, res) => controller.create(req, res))
);
submissionsRouter.get(
  '/submissions/:id',
  AuthMiddleware.validateToken,
  asyncHandler((req, res) => controller.getById(req, res))
);
submissionsRouter.get(
  '/users/:id/submissions',
  AuthMiddleware.validateToken,
  asyncHandler((req, res) => controller.getByUserId(req, res))
);

export { submissionsRouter };
