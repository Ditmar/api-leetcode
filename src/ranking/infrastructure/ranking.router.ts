import { Router } from 'express';
import { RankingController } from './controllers/ranking.controller';

const router = Router();
const controller = new RankingController();

router.get('/', (req, res) => controller.getRanking(req, res));

export { router as rankingRouter };
