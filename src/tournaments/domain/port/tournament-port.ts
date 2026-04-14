import { Tournament } from '../tournament';
import { TournamentId } from '../tournament-id';
export interface TournamentPort {
  createTournament(tournament: Tournament): Promise<Tournament>;
  getTournamentById(id: TournamentId): Promise<Tournament | null>;
  getAllTournaments(page: number, pageSize: number): Promise<Tournament[]>;
}
