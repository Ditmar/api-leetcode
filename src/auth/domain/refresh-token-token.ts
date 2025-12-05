export class RefreshTokenToken {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Refresh token cannot be empty');
    }
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: RefreshTokenToken): boolean {
    return this.value === other.value;
  }
}
