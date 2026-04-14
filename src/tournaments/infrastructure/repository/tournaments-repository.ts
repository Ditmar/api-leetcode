import { Tournament } from 'tournaments/domain/tournament';
import { TournamentId } from 'tournaments/domain/tournament-id';
import { TournamentPort } from '../../domain/port/tournament-port';
import { PrismaClient } from '@prisma/client';

export class TournamentsRepository implements TournamentPort {
  constructor(private prisma: PrismaClient) {}
  async createTournament(tournament: Tournament): Promise<Tournament> {
    const result = await this.prisma.tournament.create({
      data: {
        id: tournament.getId().getValue(),
        name: tournament.getName().getValue(),
        date: tournament.getDate().getValue(),
        brand: tournament.getBrand().getValue(),
      },
    });
    return new Tournament(result.id, result.name, result.date, result.brand);
  }
  async getTournamentById(id: TournamentId): Promise<Tournament | null> {
    const result = await this.prisma.tournament.findUnique({
      where: { id: id.getValue() },
    });
    if (!result) {
      return null;
    }
    return new Tournament(result.id, result.name, result.date, result.brand);
  }
  async getAllTournaments(
    page: number,
    pageSize: number
  ): Promise<Tournament[]> {
    const results = await this.prisma.tournament.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return results.map(
      result =>
        new Tournament(result.id, result.name, result.date, result.brand)
    );
  }
}
