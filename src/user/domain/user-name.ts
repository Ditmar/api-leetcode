export class UserName {
  private value: string;
  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    if (this.value.length < 3) {
      throw new Error('UserName must be at least 3 characters long');
    }
  }
  public getValue(): string {
    return this.value;
  }
}
