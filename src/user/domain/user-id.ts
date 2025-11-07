export class UserId {
  private value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    if (this.value.length == 0) {
      throw new Error('UserId cannot be empty');
    }
    if (this.value.length > 36) {
      throw new Error('UserId cannot be longer than 36 characters');
    }
  }
  public getValue(): string {
    return this.value;
  }
}
