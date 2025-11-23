import { Router } from 'express';
import { TestController } from '../controller/TestController';
import { authMiddleware } from '../../../share/infrastructure/middleware/auth.middleware';

const router = Router();
const controller = new TestController();

router.get('/', (req, res) => controller.getTests(req, res));
router.get('/:id', (req, res) => controller.getTestById(req, res));

router.post('/:id/start', authMiddleware, (req, res) =>
  controller.startTest(req, res)
);
router.get('/:id/questions', authMiddleware, (req, res) =>
  controller.getQuestions(req, res)
);
router.post('/:id/submit', authMiddleware, (req, res) =>
  controller.submitTest(req, res)
);

export { router as testRoutes };
