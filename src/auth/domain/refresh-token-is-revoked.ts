export class RefreshTokenIsRevoked {
  private readonly value: boolean;

  constructor(value: boolean = false) {
    this.value = value;
  }

  public getValue(): boolean {
    return this.value;
  }

  public equals(other: RefreshTokenIsRevoked): boolean {
    return this.value === other.value;
  }
}
