export class TournamentId {
  private value: string;

  constructor(value: string) {
    this.ensureIsValid(value);
    this.value = value;
  }
  private ensureIsValid(value: string): void {
    if (!value || value.trim() === '') {
      throw new Error('Tournament ID cannot be empty');
    }
  }
  public getValue(): string {
    return this.value;
  }
}
