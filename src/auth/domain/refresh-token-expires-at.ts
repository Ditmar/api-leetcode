export class RefreshTokenExpiresAt {
  private readonly value: Date;

  constructor(value: Date) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error('Invalid expiration date');
    }
    this.value = value;
  }

  public getValue(): Date {
    return this.value;
  }

  public isExpired(): boolean {
    return this.value < new Date();
  }

  public equals(other: RefreshTokenExpiresAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
