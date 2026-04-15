import { PrismaClient } from '@prisma/client';
import { Tournament } from 'tournaments/domain/tournament';
import { TournamentId } from 'tournaments/domain/tournament-id';
import { TournamentPort } from '../../domain/port/tournament-port';
import { TournamentBrand } from 'tournaments/domain/tournament-brand';
import { TournamentName } from 'tournaments/domain/tournament-name';

export class TournamentsRepository implements TournamentPort {
  constructor(private prisma: PrismaClient) {}
  async createTournament(
    name: TournamentName,
    brand: TournamentBrand
  ): Promise<Tournament> {
    const result = await this.prisma.tournament.create({
      data: {
        name: name.getValue(),
        date: new Date(),
        brand: brand.getValue(),
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
