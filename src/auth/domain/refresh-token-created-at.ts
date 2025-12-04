export class RefreshTokenCreatedAt {
  private readonly value: Date;

  constructor(value?: Date) {
    this.value = value || new Date();
  }

  public getValue(): Date {
    return this.value;
  }

  public equals(other: RefreshTokenCreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
