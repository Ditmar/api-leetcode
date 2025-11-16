import { Router } from 'express';
import { TestController } from '../controller/TestController';

const router = Router();
const controller = new TestController();

router.get('/', (req, res) => controller.getTests(req, res));

router.get('/:id', (req, res) => controller.getTestById(req, res));

router.post('/:id/start', (req, res) => controller.startTest(req, res));

router.get('/:id/questions', (req, res) => controller.getQuestions(req, res));

router.post('/:id/submit', (req, res) => controller.submitTest(req, res));

export { router as testRoutes };
