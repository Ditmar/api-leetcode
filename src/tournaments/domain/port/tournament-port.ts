import { Tournament } from '../tournament';
import { TournamentId } from '../tournament-id';
import { TournamentName } from '../tournament-name';
import { TournamentBrand } from '../tournament-brand';
export interface TournamentPort {
  createTournament(
    name: TournamentName,
    brand: TournamentBrand
  ): Promise<Tournament>;
  getTournamentById(id: TournamentId): Promise<Tournament | null>;
  getAllTournaments(page: number, pageSize: number): Promise<Tournament[]>;
}
