import { Router } from 'express';
import { ExpressTournamentsController } from '../controller/express-tournaments-controller';
const tournamentsController = new ExpressTournamentsController();
const tournamentsRoutes = Router();

tournamentsRoutes.post('/', (req, res) =>
  tournamentsController.createTournament(req, res)
);
tournamentsRoutes.get('/:id', (req, res) =>
  tournamentsController.getTournamentById(req, res)
);
tournamentsRoutes.get('/', (req, res) =>
  tournamentsController.getAllTournaments(req, res)
);
export { tournamentsRoutes };
