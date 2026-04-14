export class TournamentDate {
  private value: Date;
  constructor(value: Date) {
    this.ensureIsValid(value);
    this.value = value;
  }
  private ensureIsValid(value: Date): void {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error('Invalid date');
    }
  }
  public getValue(): Date {
    return this.value;
  }
}
