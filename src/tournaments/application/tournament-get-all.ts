import { TournamentPort } from '../domain/port/tournament-port';
import { Tournament } from '../domain/tournament';

export class TournamentGetAll {
  constructor(private tournamentPort: TournamentPort) {}
  public async execute(
    page: number,
    pageSize: number
  ): Promise<Tournament[] | null> {
    return await this.tournamentPort.getAllTournaments(page, pageSize);
  }
}
