import { TournamentPort } from '../domain/port/tournament-port';
import { Tournament } from '../domain/tournament';
import { TournamentBrand } from 'tournaments/domain/tournament-brand';
import { TournamentName } from 'tournaments/domain/tournament-name';

export class TournamentCreate {
  constructor(private tournamentPort: TournamentPort) {}
  public async execute(name: string, brand: string): Promise<Tournament> {
    const tournamentName = new TournamentName(name);
    const tournamentBrand = new TournamentBrand(brand);
    return await this.tournamentPort.createTournament(
      tournamentName,
      tournamentBrand
    );
  }
}
