import { Request, Response } from 'express';
import { services } from '../../../share/infrastructure/services';
export class ExpressTournamentsController {
  createTournament(req: Request, res: Response) {
    const { name, brand } = req.body;
    const tournament = services.tournaments.create.execute(name, brand);
    res.status(201).json(tournament);
  }
  getTournamentById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: 'Tournament ID is required' });
      return;
    }
    const tournament = services.tournaments.getById.execute(id);
    if (tournament) {
      res.json(tournament);
    } else {
      res.status(404).json({ message: 'Tournament not found' });
    }
  }
  getAllTournaments(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) ?? 1;
    const pageSize = parseInt(req.query.pageSize as string) ?? 10;
    const tournaments = services.tournaments.getAll.execute(page, pageSize);
    res.json(tournaments);
  }
}
