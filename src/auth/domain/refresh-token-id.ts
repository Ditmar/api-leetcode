import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class RefreshTokenId {
  private readonly value: string;

  constructor(value?: string) {
    if (value && !uuidValidate(value)) {
      throw new Error('Invalid UUID format for RefreshTokenId');
    }
    this.value = value || uuidv4();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: RefreshTokenId): boolean {
    return this.value === other.value;
  }
}
