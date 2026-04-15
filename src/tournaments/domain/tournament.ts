import { TournamentId } from './tournament-id';
import { TournamentName } from './tournament-name';
import { TournamentDate } from './tournament-date';
import { TournamentBrand } from './tournament-brand';

export class Tournament {
  private id: TournamentId;
  private name: TournamentName;
  private date: TournamentDate;
  private brand: TournamentBrand;
  constructor(id: string, name: string, date: Date, brand: string) {
    this.id = new TournamentId(id);
    this.name = new TournamentName(name);
    this.date = new TournamentDate(date);
    this.brand = new TournamentBrand(brand);
  }
  public getId(): TournamentId {
    return this.id;
  }
  public getName(): TournamentName {
    return this.name;
  }
  public getDate(): TournamentDate {
    return this.date;
  }
  public getBrand(): TournamentBrand {
    return this.brand;
  }
}
