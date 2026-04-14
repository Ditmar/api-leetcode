import { TournamentPort } from '../domain/port/tournament-port';
import { Tournament } from '../domain/tournament';

export class TournamentCreate {
  constructor(private tournamentPort: TournamentPort) {}
  public async execute(tournament: Tournament): Promise<Tournament> {
    return await this.tournamentPort.createTournament(tournament);
  }
}
