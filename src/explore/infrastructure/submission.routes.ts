import { Router } from 'express';
import { PrismaProblemSubmissionRepository } from './persistence/prisma-problem-submission.repository';
import { PrismaTopicRepository } from './persistence/prisma-topic.repository';
import { UpdateTopicProgressOnAcceptedUseCase } from '../application/use-cases/update-topic-progress-on-accepted.use-case';
import { ProcessSubmissionResultUseCase } from '../application/use-cases/process-submission-result.use-case';
import { SubmissionResultController } from './controllers/submission-result.controller';
import { prisma } from '../../share/infrastructure/prisma-client';

const router = Router();

const submissionRepo = new PrismaProblemSubmissionRepository(prisma);
const topicRepo = new PrismaTopicRepository(prisma);

const updateTopicProgressUseCase = new UpdateTopicProgressOnAcceptedUseCase(
  topicRepo
);
const processResultUseCase = new ProcessSubmissionResultUseCase(
  submissionRepo,
  updateTopicProgressUseCase
);

const controller = new SubmissionResultController(processResultUseCase);

router.post('/submissions/:submissionId/result', (req, res) =>
  controller.handleResult(req, res)
);

export { router as submissionRoutes };
