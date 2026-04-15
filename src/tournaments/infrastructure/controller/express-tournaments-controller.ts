import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';
export class ExpressTournamentsController {
  createTournament(req: Request, res: Response) {
    const { name, brand } = req.body;
    const tournament = services.tournaments.create.execute(name, brand);
    res.status(201).json(tournament);
  }
  async getTournamentById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: 'Tournament ID is required' });
      return;
    }
    const tournament = await services.tournaments.getById.execute(id);
    if (tournament) {
      res.json(tournament);
    } else {
      res.status(404).json({ message: 'Tournament not found' });
    }
  }
  async getAllTournaments(req: Request, res: Response) {
    console.log('query params: ----', req.query.page);
    const page = 1;
    const pageSize = 10;
    const tournaments = await services.tournaments.getAll.execute(
      page,
      pageSize
    );
    res.json(tournaments);
  }
}
