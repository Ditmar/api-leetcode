import { TournamentPort } from '../domain/port/tournament-port';
import { TournamentId } from 'tournaments/domain/tournament-id';
import { Tournament } from '../domain/tournament';

export class TournamentGetById {
  constructor(private tournamentPort: TournamentPort) {}
  public async execute(id: string): Promise<Tournament | null> {
    const tournamentId = new TournamentId(id);
    return await this.tournamentPort.getTournamentById(tournamentId);
  }
}
